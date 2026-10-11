import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

export default defineCloudflareConfig({
  // Every page is prerendered at build time and never revalidated, so serve
  // the build output straight from Workers static assets. Without a cache the
  // worker re-renders each page on every request, and pages that read
  // src/data/generated from disk (sitemap, items, mice) fail at runtime.
  // See https://opennext.js.org/cloudflare/caching
  incrementalCache: staticAssetsIncrementalCache,
});
