Additional data and information for Valour Rift, to be read alongside the [Shellnut Guide](/guides/ranks-beyond-mhbasics) and the main [Valour Rift Guide](/guides/valour-rift-guide).

## Valour Rift upgrade order

Ignore the target TEs, but the general order is still correct: [upgrade order chart](https://imgur.com/a/sv6Z1lB).

## Simulators available

- [Re's sim](https://waa.ai/re-vrift-copyable)
- [Aaron's sim](https://tinyurl.com/VRift)

> These simulators are **exclusive to Google Sheets and DO NOT WORK IN EXCEL.** (You'll know it's wrong if you see Shade 5 on the first run.)

## How to use Re's VRift Simulator

*(Thanks to stormight.)*

- **Steps** — current steps of your run; 0 if calcing a fresh run.
- **Sync** — hunts left in your run.
- **Speed** — your Speed upgrade level.
- **Siphon** — hunts gained from catching a Shade/TE (depends on your Siphon level); double this value if Super Siphon is on.
- **CF** — True if using Champion's Fire every hunt, False if not.
- **CF EC** — Champion's Fire toggled on for Shade/TE.
- **UU** — Ultimate Umbra augmentation, on or off.
- **Str. Step** — String Stepping augmentation, on or off.
- **Bail Flr** — designated floor to retreat upon reaching. Set it high unless you're calcing a retreat after a Shade/TE, in which case set it to the floor *after* those mice.

**Stats on the right-hand side:** Power and Luck values for each stage.

- **EC** — Shade / Total Eclipse floor
- **Lap 1** — floors 1–7
- **Lap 2** — floors 9–15
- **Lap 3** — floors 17–23
- **Lap 4** — floors 25–31+

**Charts at the bottom:**

- **Floor** — floor reached
- **Eclipses** — Eclipse reached
- **Frags** — Fragments / Cores looted from the respective Shade/TE (discounting CF)
- **Exactly** — chance of reaching exactly that floor/Eclipse
- **At least** — chance of reaching at least that floor/Eclipse (a run with a 50% chance of TE7 might have a 100% chance of reaching at least TE5)

> Note: the secrets/sigils values on the left side likely don't account for caches, so math accordingly.

## Calcing mid-run upgrades

1. Calculate with the Bail Floor on your desired TE floor + 1.
2. Take the minimum steps to that TE floor from the wiki, add your Speed (and +1 if CF is on).
3. Take your base hunts, add the extra hunts from Siphon, subtract the hunts taken to catch your desired TE (found in the sim).
4. Plug these step/sync numbers back into the sim with your new upgrade levels.

**Example** — say you get a 3rd extra core from TE1 (via LNY or SEH) and want to calculate upgrading Speed 6 → 7 after TE1:

- Set the Bail Floor to 9 (the floor after catching TE1).
- Look up the minimum steps to TE1 and account for steps after catching it: `140 + 6 + 1 = 147` (minimum steps, your Speed level, and 1 for CF on).
- Take your base hunts (70 at level 4 sync), add the hunts gained from level 4 Siphon (40, since only 1 TE caught), subtract the hunts to catch TE1 → result `87`.
- Put 147 and 87 into Steps and Sync, remove the Bail Floor limit, raise Speed 6 → 7, and re-calculate.

[Image of simulator pre- and post-upgrade](https://imgur.com/a/fQ9O3k5)

## Questions on VRift

*(Written by Lhwhatever.)*

**When do I use Secret Research (SR)?**

- If your upgrades still cost sigils, probably not.
- Before Siphon 5, whenever you can (you should be able to do this permanently starting Speed 7).
- After Siphon 5, you can start using it with Super Siphon (SSi). The difference between SR only and SSi+SR isn't big (SSi+SR gives +0.01 secret/hunt).
- If you're committing a lot of resources to UU runs, consider activating it as you'll likely be hitting higher floors anyway.

**When do I use Super Siphon (SSi)?**

- SSi helps you reach higher floors and Eclipses, hence more Fragments.
- It isn't as good for farming secrets. Efficiency: SSi+SR (Siphon 5) ~ SR only > SSi+SR (Siphon 4) > SSi.
- SSi+SR is heavily sigil-negative; you'll need SH-only runs to farm sigils back.
- At Speed 6 / Sync 4–5 / Siphon 4, you may need an SSi run to hit F25 to unlock UU (unless you upgrade Sync to 6).
- Use it for UU runs or when Fragments are your bottleneck. Once you get Siphon 5, SSi+SR becomes viable for farming secrets again.

**Should I get Sync 5 and 6?**

- They make a minuscule improvement to secret-gathering speed (at best 1 extra secret per 50 hunts), so they actually set back secret earning.
- But you may need them for a better chance at your next TE in a UU run. It's setup-dependent — consult the simulator.
- Conclusion: get them as late as possible, just before a UU run that needs them.

**Speed 9 or Siphon 5 first?**

- Speed 9 gets secrets faster; Siphon 5 reaches higher floors (with SSi).
- Upgrade whichever gives more TEs in your current/next UU run. If tied, go Speed 9 > Siphon 5 > Speed 10.

**How do I plan out my UU runs / use my cores?**

- You need 123 cores total to get everything (incl. PB and CDT).
- Upgrading sync mid-run still gives the 10 hunts, so you can get the last 3 cores (Sync 7) during your push — meaning you only need **120 cores** before pushing.
- Assuming no event boost, 3 run combinations get you 120+ cores:
  - **2 UU runs:** TE5 (30 cores) + TE9 (90) = 120
  - **3 UU runs:** TE4 (20) + TE5 (30) + TE8 (72) = 122
  - **4 UU runs:** TE3 (12) + TE4 (20) + TE6 (42) + TE7 (56) = 128
- Don't forget to turn on CF. Use the sims to plan charm/aura levels — expect at least lightning or spooky with CF and R2021+ for 2/3UU.
- You should almost never start UU without enough secrets for all the upgrades you plan to get during that run.

**Get upgrades in this order:**

Speed 7 → PB [1] → Speed 8 → Speed 9 + Siphon 5 (see above) → Speed 10 → CDT [3] → Sync 7

*Notes:*

1. If doing 4 UU runs, delay PB until after Speed 8.
2. If event-boosted, calculate the number of TEs required for your situation, but the upgrade order stays roughly the same.
3. You might want to rush a UU run during LNY because the tripled cores save a lot of time. If you don't have enough secrets for an upgrade but getting (C)CDT would help you get an additional TE, get CDT.
4. For some upgrades you only get enough cores after the last TE in a run. In that case, farm the secrets for that upgrade after the run (with all your new mid-run bonuses).
