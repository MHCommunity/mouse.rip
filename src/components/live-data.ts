/**
 * Shared heading style for the data sections on item and mouse pages.
 *
 * This module used to hold the client-side fetch machinery those sections ran
 * on. The data is baked in at build time now (see scripts/update-data.js), so
 * the sections render on the server and only the style survived.
 */
export const sectionTitle = 'text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500';
