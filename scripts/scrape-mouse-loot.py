#!/usr/bin/env python3
"""
Scrape mouse loot data from Alex Claxton's Tableau Public viz and write
src/data/generated/mouse-loot.json (consumed by the "Loot" section on mouse pages).

    https://public.tableau.com/app/profile/alex.claxton/viz/MH-by-mouse-ID2/MouseDroppingsandItemDroppers

The viz shows one mouse at a time (a "Mouse Name" filter), so this drives a headless
Chromium (Playwright) to bootstrap a real Tableau session and then tries to iterate
the filter across every mouse.

STATUS / KNOWN LIMITATION (2026-06):
    The session bootstrap + worksheet parsing work and return the *default* mouse's
    loot correctly. However, this particular viz does not accept an automated mouse
    selection by any method tried: the Tableau filter command returns HTTP 410 for the
    bootstrapped session (even issued from inside the live page), URL filter/parameter
    params (?Mouse Name=, ?Mouse ID=) are ignored, and the viz renders on a canvas with
    no HTML filter control to drive. So full per-mouse iteration is currently blocked.
    A preflight below detects this and exits with a clear message. If the viz adds a
    usable control or the selection mechanism changes, iteration will proceed.

Setup (one-time):
    python3 -m pip install playwright TableauScraper pandas
    python3 -m playwright install chromium

Usage:
    python3 scripts/scrape-mouse-loot.py            # full run → mouse-loot.json
    python3 scripts/scrape-mouse-loot.py --limit 20 # quick test on the first 20 mice
"""

import argparse
import json
import os
import re
import sys
import time
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA_DIR = os.path.join(ROOT, "src", "data", "generated")
OUT_PATH = os.path.join(DATA_DIR, "mouse-loot.json")
VIEW_URL = "https://public.tableau.com/views/MH-by-mouse-ID2/MouseDroppingsandItemDroppers"
WORKSHEET = "Mouse droppings"
FILTER_FIELD = "Mouse Name"
HOST = "https://public.tableau.com"


def capture_session(url):
    """Load the viz in headless Chromium; return (bootstrap_payload, session_url, cookies)."""
    from playwright.sync_api import sync_playwright

    payloads, session_urls = [], []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1400, "height": 1000})
        page = context.new_page()

        def on_response(r):
            if "bootstrapSession" in r.url:
                session_urls.append(r.url)
                try:
                    payloads.append(r.text())
                except Exception:
                    pass

        page.on("response", on_response)
        page.goto(url, wait_until="domcontentloaded", timeout=90000)
        if "not-found" in page.url or "404" in (page.title() or ""):
            browser.close()
            sys.exit("Tableau returned 'not found' for this viz — check the --url.")
        try:
            page.wait_for_load_state("networkidle", timeout=60000)
        except Exception:
            pass
        page.wait_for_timeout(5000)
        cookies = context.cookies()
        browser.close()

    if not payloads or not session_urls:
        sys.exit("No bootstrapSession payload captured — the viz may have failed to load.")
    return max(payloads, key=len), session_urls[0], cookies


def make_scraper(payload, session_url, cookies):
    """Build a TableauScraper with a live session seeded from the browser."""
    from tableauscraper import TableauScraper, api, utils

    ts = TableauScraper(delayMs=150)
    api.setSession(ts)
    for c in cookies:
        try:
            ts.session.cookies.set(c["name"], c["value"], domain=c.get("domain"), path=c.get("path", "/"))
        except Exception:
            pass

    root, sid = session_url.split(HOST, 1)[1].split("/bootstrapSession/sessions/")
    ts.host = HOST
    ts.tableauData = {"vizql_root": root, "sessionid": sid}

    match = re.search(r"\d+;({.*})\d+;({.*})", payload, re.MULTILINE)
    if not match:
        sys.exit("Captured payload was not in the expected Tableau bootstrap format.")
    ts.info = json.loads(match.group(1))
    ts.data = json.loads(match.group(2))
    if "presModelMap" in ts.data["secondaryInfo"]:
        pres = ts.data["secondaryInfo"]["presModelMap"]
        ts.dataSegments = pres["dataDictionary"]["presModelHolder"]["genDataDictionaryPresModel"]["dataSegments"]
        ts.parameters = utils.getParameterControlInput(ts.info)
    ts.dashboard = ts.info["sheetName"]
    ts.filters = utils.getFiltersForAllWorksheet(ts.logger, ts.data, ts.info, rootDashboard=ts.dashboard)
    return ts


def to_pct(value):
    """Parse a drop-likelihood string like '0.01%' to a number of percent."""
    if value is None:
        return None
    s = re.sub(r"[^0-9.\-]", "", str(value))
    if s in ("", "-", "."):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def to_int(value):
    n = to_pct(value)
    return int(n) if n is not None else None


def pivot_loot(df):
    """Collapse the measure-name/value rows into one entry per item (best drop rate across locations)."""
    by_item_loc = defaultdict(dict)
    for _, row in df.iterrows():
        item = str(row.get("Item-alias", "")).strip()
        loc = str(row.get("Location name-alias", "")).strip()
        measure = str(row.get("Measure Names-alias", "")).strip()
        value = row.get("Measure Values-alias")
        if not item or item.lower() == "nan":
            continue
        by_item_loc[(item, loc)][measure] = value

    best = {}
    for (item, _loc), measures in by_item_loc.items():
        pct = to_pct(measures.get("Drop likelihood"))
        entry = best.get(item)
        if entry is None or (pct is not None and pct > entry.get("drop_pct", -1)):
            new = {"item": item}
            if pct is not None:
                new["drop_pct"] = round(pct, 2)
            mn = to_int(measures.get("Min drops"))
            mx = to_int(measures.get("Max drops"))
            if mn is not None:
                new["min"] = mn
            if mx is not None:
                new["max"] = mx
            best[item] = new
    return sorted(best.values(), key=lambda e: e.get("drop_pct", 0), reverse=True)


def load_name_to_id():
    with open(os.path.join(DATA_DIR, "mice.json"), encoding="utf-8") as fh:
        mice = json.load(fh)
    mapping = {}
    for m in mice:
        mapping[m["name"].strip().lower()] = m["id"]
        if m.get("abbreviated_name"):
            mapping[m["abbreviated_name"].strip().lower()] = m["id"]
    return mapping


def main():
    parser = argparse.ArgumentParser(description="Scrape mouse loot from the Tableau Public viz.")
    parser.add_argument("--url", default=VIEW_URL)
    parser.add_argument("--limit", type=int, help="Only process the first N mice (for testing).")
    args = parser.parse_args()

    print("Bootstrapping Tableau session …", flush=True)
    ts = make_scraper(*capture_session(args.url))
    ws = ts.getWorksheet(WORKSHEET)

    filt = next((f for f in ws.getFilters() if f["column"] == FILTER_FIELD), None)
    if not filt:
        sys.exit(f"Couldn't find the {FILTER_FIELD!r} filter on worksheet {WORKSHEET!r}.")
    mouse_names = filt["values"]
    if args.limit:
        mouse_names = mouse_names[: args.limit]
    print(f"Iterating {len(mouse_names)} mice …", flush=True)

    # Preflight: confirm an automated mouse selection actually changes the data.
    default_items = {str(v) for v in ws.data.get("Item-alias", [])}
    try:
        probe_wb = ws.setFilter(FILTER_FIELD, mouse_names[-1])
        probe = next((w for w in probe_wb.worksheets if w.name == WORKSHEET), None)
        probe_items = {str(v) for v in probe.data.get("Item-alias", [])} if probe is not None else set()
    except Exception:
        probe_items = set()
    if not probe_items or probe_items == default_items:
        sys.exit(
            "Preflight failed: this viz did not accept an automated mouse selection "
            "(filter command returns no data / HTTP 410, and URL params are ignored). "
            "Per-mouse loot can't be scraped headlessly here — see the script header for details."
        )

    name_to_id = load_name_to_id()
    loot, unmatched, fail_streak = {}, [], 0

    for i, name in enumerate(mouse_names, 1):
        mouse_id = name_to_id.get(name.strip().lower())
        try:
            wb = ws.setFilter(FILTER_FIELD, name)
            sub = next((w for w in wb.worksheets if w.name == WORKSHEET), None)
            entries = pivot_loot(sub.data) if sub is not None and not sub.data.empty else []
            fail_streak = 0
        except Exception as exc:  # noqa: BLE001
            fail_streak += 1
            print(f"  ! {name}: {exc}", flush=True)
            if fail_streak >= 6:
                print("  … re-establishing session", flush=True)
                ts = make_scraper(*capture_session(args.url))
                ws = ts.getWorksheet(WORKSHEET)
                fail_streak = 0
            continue

        if mouse_id is None:
            unmatched.append(name)
        elif entries:
            loot[str(mouse_id)] = entries

        if i % 25 == 0 or i == len(mouse_names):
            with open(OUT_PATH, "w", encoding="utf-8") as fh:
                json.dump(loot, fh)
            print(f"  [{i}/{len(mouse_names)}] {len(loot)} mice with loot saved", flush=True)
        time.sleep(0.1)

    with open(OUT_PATH, "w", encoding="utf-8") as fh:
        json.dump(loot, fh)
    print(f"\nDone. Loot for {len(loot)} mice → {OUT_PATH}", flush=True)
    if unmatched:
        print(f"{len(unmatched)} filter names had no matching mouse, e.g. {unmatched[:10]}", flush=True)


if __name__ == "__main__":
    main()
