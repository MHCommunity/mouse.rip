/** Wisdom thresholds for hunter titles, shared by the Titles page and the rank-up calculator. */

// Total wisdom required to reach each title, keyed by title id.
export const WISDOM_BY_TITLE: Record<string, number> = {
  novice: 0,
  recruit: 2_000,
  apprentice: 5_000,
  initiate: 12_500,
  journeyman: 31_250,
  master: 65_440,
  grandmaster: 137_813,
  legendary: 303_188,
  hero: 667_013,
  knight: 1_467_428,
  lord_lady: 3_228_341,
  baron_baroness: 7_102_349,
  count_countess: 15_625_168,
  duke_dutchess: 34_375_370,
  grand_duke: 75_625_813,
  archduke_archduchess: 166_376_789,
  viceroy: 366_028_936,
  elder: 805_263_659,
  sage: 1_771_580_048,
  fabled: 3_897_476_106,
};

