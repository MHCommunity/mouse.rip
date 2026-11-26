/**
 * The items, mice and places the catch rate special cases depend on, by type.
 *
 * Ported from tsitu's MH-Tools (src/main/shared-cre-setup.js, data/arrays.js, build/process-trap-data.js) and
 * MouseHunt Improved's catch rate estimate (src/modules/catch-rate-estimate/data.js). Where the two disagree,
 * MouseHunt Improved is the newer of the two and wins; each case says which it follows.
 */

/** Cheeses that attract less than 100% of the time with no attraction bonus (MH-Tools' cheese-attraction.js). */
export const CHEESE_BASE_ATTRACTION: Record<string, number> = {
  arctic_asiago_cheese: 0.9,
  bland_queso_cheese: 0.9,
  brie_cheese: 0.85,
  brie_string_cheese: 0.85,
  treat_cheese: 0.97,
  cheddar_cheese: 0.7,
  cherry_cheese: 0.88,
  crimson_cheese: 0.9,
  toxic_brie_cheese: 0.85,
  festive_feta_cheese: 0.9,
  trick_cheese: 0.8957,
  gilded_cheese: 0.85,
  gingerbread_cheese: 0.9,
  gouda_cheese: 0.9,
  marble_cheese: 0.75,
  marble_string_cheese: 0.75,
  mozzarella_cheese: 0.7,
  nutmug_cheese: 0.9,
  seasoned_gouda_cheese: 0.9,
  snowball_cheese: 0.9,
  swiss_cheese: 0.8,
  swiss_string_cheese: 0.8,
  white_cheddar_cheese: 0.7,
};

/** Empowered cheeses add 20% power bonus. Brie and SUPER|brie+ can be toggled to their Empowered form. */
export const EMPOWERED_CHEESES = new Set(['toxic_brie_cheese', 'toxic_super_brie_cheese']);
export const EMPOWERABLE_CHEESES = new Set(['brie_cheese', 'super_brie_cheese']);

/** The Rift set: two pieces add 20% power bonus, three add 5 luck too, and the Riftstalker Codex doubles both. */
export const RIFT_WEAPONS = new Set([
  'biomolecular_reatomizer_weapon',
  'celestial_dissonance_weapon',
  'christmas_crystalabra_weapon',
  'chrome_celestial_dissonance_weapon',
  'crystal_tower_weapon',
  'dark_chocolate_bunny_weapon',
  'derelict_airship_weapon',
  'focused_crystal_laser_weapon',
  'multi_crystal_laser_weapon',
  'rift_mynorca_weapon',
  'rift_glacier_gatler_weapon',
  'temporal_dissonance_weapon',
  'wacky_inflatable_party_people_weapon',
]);
export const RIFT_BASES = new Set([
  'furoma_rift_energy_upgraded_base',
  'clockwork_base',
  'elixir_exchanger_base',
  'furoma_rift_energy_base',
  'fissure_base',
  'fracture_base',
  'mist_meter_regulator_base',
  'valour_rift_prestige_base',
  'rift_base',
  'hailstone_singularity_base',
  'rift_mist_diffuser_base',
]);
/** Plus any charm with "rift" in its name. */
export const RIFT_CHARMS = new Set([
  'cherry_trinket',
  'gnarled_trinket',
  'wicked_gnarly_trinket',
  'rift_furoma_energy_trinket',
  'rift_super_furoma_energy_trinket',
  'temporal_fusion_trinket',
  'eggstra_charge_trinket',
]);

/** Snowball, Spooky and Party Charms add 20% power bonus with a trap from their event. */
export const FESTIVE_WEAPONS = new Set([
  'christmas_cactus_weapon',
  'christmas_cracker_trap_weapon',
  'christmas_crystalabra_weapon',
  'double_diamond_toboggan_adventure_weapon',
  'explosive_toboggan_ride_weapon',
  'chrono_gwh_weapon',
  'xmas_2016_forgotten_weapon',
  'festive_gauntlet_crusher_weapon',
  'gingerbread_house_surprise_weapon',
  'glacier_gatler_weapon',
  'goldfrost_crossbow_weapon',
  'snow_golem_trap_weapon',
  'harrowing_holiday_harp_weapon',
  'xmas_2016_hydro_weapon',
  'ice_blaster_weapon',
  'great_winter_event_horizon_weapon',
  'nutcracker_winter_weapon',
  'rift_glacier_gatler_weapon',
  'pirate_sleigh_weapon',
  'snow_barrage_weapon',
  'snowglobe_trap_weapon',
  'holiday_express_weapon',
  'winter_hunt_2012_weapon',
]);
export const HALLOWEEN_WEAPONS = new Set([
  'admirals_galleon_weapon',
  'boiling_cauldron_weapon',
  'brain_extractor_weapon',
  'cackle_lantern_weapon',
  'candy_crusher_weapon',
  'cemetery_gate_grappler_weapon',
  'halloween_haunted_shipwreck_weapon',
  'brain_extractor_upgrade_weapon',
  'pumpkin_pummeler_weapon',
  'sandcastle_shard_weapon',
  'hween_2011_weapon',
  'hween_2011_upgraded_weapon',
  'terrifying_spider_weapon',
  'haunting_house_weapon',
]);
export const BIRTHDAY_WEAPONS = new Set([
  'anniversary_ambush_weapon',
  'anniversary_ancient_box_trap_weapon',
  'anniversary_acronym_weapon',
  'anniversary_mouse_deathbot_weapon',
  'anniversary_reaper_perch_weapon',
  'bday_candle_kaboom_weapon',
  'bday_2012_weapon',
  'bubbles_party_crasher_weapon',
  'nannybot_weapon',
  'queso_factory_weapon',
  'sprinkley_cupcake_surprise_weapon',
  'cupcake_bot_weapon',
  'surprise_party_weapon',
  'forgotten_art_of_dance_weapon',
  'ultra_megamouser_mechabot_weapon',
  'wacky_inflatable_party_people_weapon',
]);

/** The 10th anniversary traps: a 10% chance to catch whatever the catch rate. */
export const ANNIVERSARY_WEAPONS = new Set([
  'anniversary_acronym_weapon',
  'anniversary_ambush_weapon',
  'anniversary_ancient_box_trap_weapon',
  'anniversary_mouse_deathbot_weapon',
  'anniversary_reaper_perch_weapon',
]);

/** Charms that change the trap's power type (except on the Isle Idol and Golem Guardian traps). */
export const POWER_TYPE_CHARMS: Record<string, string> = {
  forgotten_trinket: 'forgotten',
  nanny_trinket: 'parental',
  hydro_trinket: 'hydro',
  shadow_trinket: 'shadow',
};

/** The Taunting Charm counts as a Rift piece against these Rift bosses, if another Rift piece is armed. */
export const TAUNTING_MICE = new Set(['rift_centaur', 'rift_cyclops', 'rift_black_widow', 'rift_hydra']);

/** The S.S. Scoundrel Sleigher's 33% chance against pirates is MH-Tools' estimate, not a published figure. */
export const PIRATE_MICE = new Set([
  'suave_pirate',
  'cutthroat_pirate',
  'cutthroat_cannoneer',
  'scarlet_revenger',
  'mairitime_pirate',
  'admiral_cloudbeard',
  'cabin_boy',
  'dashing_buccaneer',
  'bilged_boatswain',
  'barmy_gunner',
  'pirate',
  'corrupt_commodore',
  'buccaneer',
  'pirate_anchor',
  'dread_pirate_mousert',
  'deranged_deckhand',
  'scorned_pirate',
  'rift_ghost_pirate',
  'hween_2017_boss',
  'hween_2018_boss',
]);

/** Furoma Rift battery level: [power, luck]. */
export const BATTERY: [number, number][] = [
  [0, 0],
  [90, 0],
  [500, 1],
  [3000, 2],
  [8500, 5],
  [16000, 10],
  [30000, 12],
  [50000, 25],
  [90000, 35],
  [190000, 50],
  [300000, 100],
];

export const FOLKLORE_LOCATIONS = new Set([
  'foreword_farm',
  'prologue_pond',
  'table_of_contents',
  'bountiful_beanstalk',
  'school_of_sorcery',
  'draconic_depths',
  'afterword_acres',
  'epilogue_falls',
  'conclusion_cliffs',
]);
export const TRIBAL_LOCATIONS = new Set(['derr_dunes', 'nerg_plains', 'elub_shore']);

/** Fort Rox: the Nightlight Charm's power bonus by phase. */
export const NIGHTLIGHT_BONUS: Record<string, number> = {
  Day: 1,
  Twilight: 3,
  Midnight: 5,
  Pitch: 7,
  'Utter Darkness': 9,
  'First Light': 12,
  Dawn: 15,
};

/** The Golem Guardian Trap's stats depend on its skin's power type (MH-Tools' process-trap-data.js). */
export const GOLEM_GUARDIAN = 'snow_golem_trap_weapon';
export const GOLEM_GUARDIAN_TYPES: Record<string, { power: number; luck: number }> = {
  arcane: { power: 6000, luck: 28 },
  forgotten: { power: 7000, luck: 15 },
  hydro: { power: 10000, luck: 28 },
  physical: { power: 7000, luck: 32 },
  tactical: { power: 5000, luck: 30 },
};

/** The Isle Idol's two skins change its power type and stats. */
export const ISLE_IDOL = 'isle_idol_weapon';
export const ISLE_IDOL_SKINS: Record<
  string,
  { powerType: string; power: number; bonus: number; attraction: number; luck: number; freshness: number }
> = {
  hydroplane: { powerType: 'hydro', power: 3500, bonus: 5, attraction: 15, luck: 10, freshness: -1 },
  stakeshooter: { powerType: 'tactical', power: 3750, bonus: 12, attraction: 5, luck: 14, freshness: -1 },
};

/** Charged Denture Bases; the game's listed stats are the toothless ones. */
export const DENTURE_CHARGED: Record<string, { power: number; bonus: number; attraction: number; luck: number }> = {
  denture_base: { power: 1500, bonus: 25, attraction: 25, luck: 20 },
  upgraded_denture_base: { power: 3750, bonus: 25, attraction: 25, luck: 50 },
};

/** Printing Press Bases at full strength in Folklore Forest; anywhere else they drop to their Paperless stats. */
export const PRINTING_PRESS_BASES = new Set(['folklore_printing_press_base', 'naughty_list_printing_press_base']);
export const PRINTING_PRESS = { power: 4500, bonus: 35, attraction: 35, luck: 57, freshness: 1 };
export const PAPERLESS_PENALTY = { power: 4000, bonus: 20, attraction: 35, luck: 47 };

/** Bases whose stats grow with the highest Umbra floor reached in the Valour Rift. */
export const PRESTIGE_BASES = new Set(['valour_rift_prestige_base', 'hailstone_singularity_base']);

/** King Grub and King Scarab lose power with each salt in the Sand Crypts: thresholds and power lost per salt. */
export const SALT_CURVES: Record<string, { thresholds: number[]; perSalt: number[] }> = {
  king_scarab: { thresholds: [0, 30, 40, 50], perSalt: [25000, 12500, 6500, 0] },
  default: {
    thresholds: [0, 6, 7, 10, 14, 18, 23, 24, 27, 34, 44, 48, 50],
    perSalt: [50000, 40000, 20000, 10000, 5000, 2500, 1000, 1500, 1000, 500, 1000, 2000, 0],
  },
};

/** Dragonbane charms' power bonus against dragons. */
export const DRAGONBANE_BONUS: Record<string, number> = {
  dragonbane_trinket: 300,
  super_dragonbane_trinket: 600,
  extrme_dragonbane_trinket: 900,
  ultimate_dragonbane_trinket: 1200,
};

/** Super Warpath charms add 50% power bonus against their own troops (cre-mice-groups' fiery_warpath). */
export const WARPATH_CHARMS: Record<string, string> = {
  super_flame_march_archer_trinket: 'archers',
  super_flame_march_cavalry_trinket: 'cavalry',
  super_flame_march_mage_trinket: 'mages',
  super_flame_march_scout_trinket: 'scouts',
  super_flame_march_warrior_trinket: 'warriors',
  // MouseHunt Improved checks super_flame_march_commander_trinket, which isn't the charm's type.
  super_flame_march_general_trinket: 'commanders',
};
