function getItem(id) {
  return (getItems()).find((item) => item.id.toString() === id);
}

function getItemsByCategory(category) {
  return (getItems()).filter((item) => item.category === 'all' || item.category === category);
}

function getItemsByLocation(location) {
  return (getItems()).filter((item) => item.locations?.includes('all') || item.locations?.includes(location));
}

function getItems() {
  const items = [
    {
      id: 'mousehunt-improved',
      name: 'MouseHunt Improved',
      description: 'A collection of improvements for MouseHunt.',
      url: 'https://github.com/MHCommunity/mousehunt-improved',
      source: 'GitHub',
      category: 'extension',
      locations: ['all'],
      priority: 1
    },
    {
      id: 'mhct-extension',
      name: 'MHCT MouseHunt Helper',
      description: 'Provides useful links and tracks game data for tools like catch rate calculators.',
      url: 'https://github.com/m-h-c-t/mh-helper-extension',
      category: 'extension',
      locations: ['all'],
      priority: 3
    },
    {
      id: 'mousehunt-essentials-guide',
      name: 'MouseHunt Essentials Guide',
      description: 'An up-to-date guide for all things MouseHunt.',
      url: 'https://guide.mouse.rip/',
      source: 'guide.mouse.rip',
      category: 'guide',
      locations: [
        'meadow',
        'town-of-gnawnia',
        'windmill',
        'harbour',
        'mountain',
        'calm-clearing',
        'great-gnarled-tree',
        'lagoon',
        'laboratory',
        'mousoleum',
        'bazaar',
        'training-grounds',
        'dojo',
        'meditation-room',
        'pinnacle-chamber',
        'catacombs',
        'acolyte-realm',
        'forbidden-grove',
        'cape-clawed',
        'elub-shore',
        'nerg-plains',
        'derr-dunes',
        'jungle-of-dread',
        'dracano',
        'claw-shot-city',
        'fort-rox',
        'fiery-warpath',
        'muridae-market',
        'living-garden',
        'ss-huntington-iv',
        'seasonal-garden',
        'zugzwangs-tower',
        'slushy-shoreline',
        'iceberg',
        'sunken-city',
        'queso-river',
        'prickly-plains',
        'cantera-quarry',
        'queso-geyser',
        'gnawnia-rift',
      ],
      priority: 2
    },
    {
      id: 'minimum-luck-values',
      name: 'Minimum Luck Values',
      description: 'Minluck values for all mice.',
      url: 'https://docs.google.com/spreadsheets/d/13hKjNDFTFR3rTkmQzyi3d4ZDOlQJUvTfWPDQemmFW_Y/edit#gid=824520716',
      source: 'Google Docs',
      category: 'spreadsheet'
    },
    {
      id: 'wisdom-values',
      name: 'Wisdom Values',
      description: 'It\'s not experience, it\'s wisdom!',
      url: 'https://docs.google.com/spreadsheets/d/1nzD6iiHauMMwD2eHBuAyRziYJtCVnNwSYzCKbBnrRgc/edit#gid=1426419522',
      source: 'Google Docs',
      category: 'spreadsheet'
    },
    {
      id: 'mousehunt-crown-tracker',
      name: 'MouseHunt Crown Tracker',
      description: 'Silvermane\'s Crown Tracker Worksheet',
      url: 'https://docs.google.com/spreadsheets/d/1Al1zqq3sYt5vDI-NJCGARDNnoswv7t99c4MaZGuoAkY/edit#gid=1010310312',
      source: 'Google Docs',
      category: 'spreadsheet'
    },
    {
      id: 'location-specific-trap-effects',
      name: 'Location Specific Trap Effects',
      description: 'Effects of traps and bases that are location-specific.',
      url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRg_s_It1mDCefWgwc-7Gexr5Hc7lKBztFue9kYZidI76iodSUan3BoGsagLCI1M26U_zG7uVMe9kgK/pubhtml?gid=0&single=true',
      source: 'Google Docs',
      category: 'spreadsheet'
    },
    {
      id: 'most-mice-caught-in-a-row',
      name: 'Most Mice Caught in a Row',
      description: 'How many mice of the same mouse can you catch in a row?',
      url: 'https://docs.google.com/spreadsheets/d/1AaZ7Fm_wpT_QNyvNoMLhcUdW7Z9MIJhGqlWGWAZmBjw/edit?authkey=CIT9pL4M&authkey=CIT9pL4M',
      source: 'Google Docs',
      category: 'spreadsheet'
    },
    {
      id: 'mousehunt-item-db',
      name: 'MouseHunt Item DB',
      description: 'Item IDs, types, stats, and more.',
      url: 'https://docs.google.com/spreadsheets/d/1xWFQgV3T2NOvfN_I8kvFxWHbH9i240rp2UFi2SEi6Zc/edit#gid=1624144283',
      source: 'Google Docs',
      category: 'spreadsheet'
    },
    {
      id: 'mousehunt-community-tools',
      name: 'MouseHunt Community Tools',
      description: 'A collection of tools for MouseHunt.',
      url: 'https://mhct.win/',
      category: 'tool'
    },
    {
      id: 'catch-rate-estimator',
      name: 'Catch Rate Estimator',
      description: 'Calculate your catch rate, based on setup.',
      url: 'https://tsitu.github.io/MH-Tools/cre.html',
      category: 'tool'
    },
    {
      id: 'markethunt',
      name: 'Markethunt',
      description: 'A tool for tracking the prices of items in the MouseHunt market.',
      url: 'https://markethunt.vsong.ca/',
      category: 'tool'
    },
    {
      id: 'mousehunt-api',
      name: 'MouseHunt API',
      description: 'An unofficial API for MouseHunt.',
      url: 'https://api.mouse.rip/',
      category: 'tool'
    },
    {
      id: 'mouse-an-item-drops',
      name: 'Mouse & Item Drops',
      description: 'View what items mice drop, how likely, and how much.',
      url: 'https://public.tableau.com/app/profile/alex.claxton/viz/MH-by-mouse-ID2/MouseDroppingsandItemDroppers',
      category: 'tool',
      source: 'Tableau'
    },
    {
      id: 'salt-calculator',
      name: 'Salt Calculator',
      description: 'Calculate \'Optimal\' Saltiness for King Grub.',
      url: 'https://m-h-c-t.github.io/mh-info/calculators/salt.html',
      tags: ['calculator'],
      locations: ['sand-dunes'],
      category: 'tool'
    },
    {
      id: 'valour-rift-floors',
      name: 'Valour Rift Floors',
      description: 'Easily see what floors are coming up in your Valour Rift runs.',
      url: '/valour-rift-floors',
      category: 'tool',
      tags: ['location', 'calculator'],
      locations: ['valour-rift'],
    }
  ];

  const userscripts = [
    {
      id: 'minluck-and-catch-rate-estimate',
      name: 'Minluck & Catch Rate Estimate',
      description: 'View the minluck and catch rate estimate, right on the camp page.',
      url: 'https://greasyfork.org/en/scripts/449334-mousehunt-minluck-catch-rate-estimate',
      category: 'userscript',
      tags: ['hunting', 'catch-rate', 'minluck'],
      source: 'GreasyFork'
    },
    {
      id: 'minluck-and-cre-tool',
      name: 'Minluck & CRE tool',
      description: 'Shows hunt statistics on the camp page.',
      url: 'https://greasyfork.org/en/scripts/447193-mh-minluck-cre-tool-v2-0-new',
      category: 'userscript',
      tags: ['stats', 'hunting'],
      source: 'GreasyFork'
    },
    {
      id: 'markethunt-userscript',
      name: 'Markethunt',
      description: 'Adds a price chart and Markethunt integration to the MH marketplace screen.',
      url: 'https://greasyfork.org/en/scripts/441382-markethunt-plugin-for-mousehunt',
      category: 'userscript',
      tags: ['items', 'marketplace'],
      source: 'GreasyFork'
    },
    {
      id: 'wisdom-stats',
      name: 'Wisdom Stats',
      description: 'Displays your wisdom stats in the HUD.',
      url: 'https://greasyfork.org/en/scripts/381219-mousehunt-wisdom-stats',
      category: 'userscript',
      tags: ['stats'],
      source: 'GreasyFork'
    },
    {
      id: 'favorite-setups',
      name: 'Favorite Setups+',
      description: 'Unlimited custom favorite trap setups!',
      url: 'https://greasyfork.org/en/scripts/443164-mousehunt-favorite-setups',
      category: 'userscript',
      tags: ['quality-of-life'],
      source: 'GreasyFork'
    },
    {
      id: 'mh-timers-plus',
      name: 'MH Timers+',
      description: 'Handy script to keep track of the various MH location timers.',
      url: 'https://greasyfork.org/en/scripts/388058-mh-timers',
      category: 'userscript',
      tags: ['quality-of-life'],
      source: 'GreasyFork'
    },
    {
      id: 'profile-plus',
      name: 'Profile+',
      description: 'Community requested features for the tabs on your MH profile.',
      url: 'https://greasyfork.org/en/scripts/381389-mh-profile',
      category: 'userscript',
      tags: ['quality-of-life'],
      source: 'GreasyFork'
    },
    {
      id: 'marketplace-ui-tweaks',
      name: 'Marketplace UI Tweaks',
      description: 'Adds useful features and tweaks to the Marketplace rework',
      url: 'https://greasyfork.org/en/scripts/378990-mousehunt-marketplace-ui-tweaks',
      category: 'userscript',
      tags: ['quality-of-life'],
      source: 'GreasyFork'
    },
    {
      id: 'tournament-time-helper',
      name: 'Tournament Time Helper',
      description: 'Automatically converts \'Begins in:\' to your local time as well as adding the end time for tournaments.',
      url: 'https://greasyfork.org/en/scripts/37146-mousehunt-tournament-time-helper',
      category: 'userscript',
      tags: ['quality-of-life', 'ui'],
      source: 'GreasyFork'
    },
    {
      id: 'qol-utilities',
      name: 'QoL Utilities',
      description: 'Miscellaneous utilities to turbo-charge your MH experience',
      url: 'https://greasyfork.org/en/scripts/405334-mousehunt-qol-utilities',
      category: 'userscript',
      tags: ['quality-of-life'],
      source: 'GreasyFork'
    },
    {
      id: 'censor-journal-names',
      name: 'Censor Journal Names',
      description: 'Adds toggle button at top of journal to blur out names of friends/mapmates in most journal entries',
      url: 'https://greasyfork.org/en/scripts/445553-mh-censor-journal-names',
      category: 'userscript',
      tags: ['ui', 'journal'],
      source: 'GreasyFork'
    },
    {
      id: 'send-supplies-search-bar',
      name: 'Send Supplies Search Bar',
      description: 'Adds a search bar to make sending supplies easier',
      url: 'https://greasyfork.org/en/scripts/396714-mousehunt-send-supplies-search-bar',
      category: 'userscript',
      tags: ['quality-of-life'],
      source: 'GreasyFork'
    },
    {
      id: 'enhanced-search',
      name: 'Enhanced Search',
      description: 'Improve the search logic of search bars in the game',
      url: 'https://greasyfork.org/en/scripts/446436-mousehunt-enhanced-search-beta',
      category: 'userscript',
      tags: ['quality-of-life'],
      source: 'GreasyFork'
    },
    {
      id: 'tem-catch-stats',
      name: 'TEM Catch Stats',
      description: 'Adds catch/crown statistics next to mouse names on the TEM',
      url: 'https://greasyfork.org/en/scripts/376770-mousehunt-tem-catch-stats',
      category: 'userscript',
      tags: ['stats'],
      source: 'GreasyFork'
    },
    {
      id: 'm400-hunting-helper',
      name: 'M400 Hunting Helper',
      description: 'Adds the ability to one click travel to the next M400 assigment location',
      url: 'https://greasyfork.org/en/scripts/429044-mh-m400-hunting-helper',
      category: 'userscript',
      tags: ['quality-of-life'],
      source: 'GreasyFork'
    },
    {
      id: 'consolidated-map-colour-coder',
      name: 'Consolidated Map Colour Coder',
      description: 'Colour code your maps',
      url: 'https://greasyfork.org/en/scripts/428959-mh-consolidated-map-colour-coder',
      category: 'userscript',
      tags: ['maps'],
      source: 'GreasyFork'
    },
    {
      id: 'map-crown-display',
      name: 'Map Crown Display',
      description: 'Adds catch/crown statistics next to mouse names on the map',
      url: 'https://greasyfork.org/en/scripts/427193-mh-map-crown-display',
      category: 'userscript',
      tags: ['ui', 'maps', 'stats'],
      source: 'GreasyFork'
    },
    {
      id: 'mapping-helper',
      name: 'Mapping Helper',
      description: 'Map improvements: Invite via Hunter ID, and directly send SB+',
      url: 'https://greasyfork.org/en/scripts/384275-mousehunt-mapping-helper',
      category: 'userscript',
      tags: ['quality-of-life'],
      source: 'GreasyFork'
    },
    {
      id: 'flrt-tool',
      name: 'FLRT Tool',
      description: 'Free Leech Return Tradables',
      url: 'https://greasyfork.org/en/scripts/452655-flrt-tool',
      category: 'userscript',
      tags: ['quality-of-life', 'maps'],
      source: 'GreasyFork'
    },
    {
      id: 'floating-islands-hud-enhancer',
      name: 'Floating Islands HUD Enhancer',
      description: 'See more thing on your floating islands HUD!',
      url: 'https://greasyfork.org/en/scripts/419909-mh-floating-islands-hud-enhancer',
      category: 'userscript',
      tags: ['location', 'HUD'],
      locations: ['floating-islands'],
      source: 'GreasyFork'
    },
    {
      id: 'floting-islands-priority-calculator',
      name: 'Floting Islands Priority Calculator',
      description: '',
      url: 'https://greasyfork.org/en/scripts/411180-mousehunt-floting-islands-priority-calculator',
      category: 'userscript',
      tags: ['location', 'calculator'],
      locations: ['floating-islands'],
      source: 'GreasyFork'
    },
    {
      id: 'valour-rift-hud-enhancer',
      name: 'Valour Rift HUD Enhancer',
      description: 'Changes the text that appears in the Valour Rift hud tooltips to give you the info you actually want to see',
      url: 'https://greasyfork.org/en/scripts/392742-mh-valour-rift-hud-enhancer',
      category: 'userscript',
      tags: ['location', 'HUD'],
      locations: ['valour-rift'],
      source: 'GreasyFork'
    },
    {
      id: 'living-garden-hud-enhancer',
      name: 'Living Garden HUD Enhancer',
      description: 'Quick travel buttons for the Living Garden area locations',
      url: 'https://greasyfork.org/en/scripts/407059-mh-living-garden-hud-enhancer',
      category: 'userscript',
      tags: ['location', 'travel'],
      locations: ['living-garden'],
      source: 'GreasyFork'
    },
    {
      id: 'warpath-wave-calculator',
      name: 'Warpath Wave Calculator',
      description: 'Keeps track of remaining wave mice to help you manage the wave',
      url: 'https://greasyfork.org/en/scripts/390221-mh-warpath-wave-calculator',
      category: 'userscript',
      tags: ['location', 'calculator'],
      locations: ['fiery-warpath'],
      source: 'GreasyFork'
    },
    {
      id: 'deep-run-assistant',
      name: 'Deep Run Assistant',
      description: 'Helps you check if you have failed a Deep Run',
      url: 'https://greasyfork.org/en/scripts/380861-mousehunt-deep-run-assistant',
      category: 'userscript',
      tags: ['location', 'quality-of-life'],
      locations: ['iceberg'],
      source: 'GreasyFork'
    },
    {
      id: 'seh-loot-counter-for-hunting-log',
      name: 'SEH Loot Counter for Hunting Log',
      description: 'Counts the number of unique loot you have in your daily hunting log.',
      url: 'https://greasyfork.org/en/scripts/381058-mousehunt-seh-loot-counter-for-hunting-log',
      category: 'userscript',
      tags: ['event', 'seh'],
      source: 'GreasyFork'
    },
    {
      id: 'spooky-shuffle-tracker',
      name: 'Spooky Shuffle Tracker',
      description: 'Play Spooky Shuffle more easily.',
      url: 'https://greasyfork.org/en/scripts/453305-mousehunt-better-spooky-shuffle-tracker',
      category: 'userscript',
      tags: ['event', 'halloween'],
      source: 'GreasyFork'
    },
    {
      id: 'gifting-buttons',
      name: 'Gifting Buttons',
      description: 'Adds buttons to easily ignore, accept, or return all free gifts.',
      url: 'https://greasyfork.org/en/scripts/376572-mousehunt-gifting-buttons',
      category: 'userscript',
      tags: ['quality-of-life'],
      source: 'GreasyFork'
    },
    {
      id: 'spring-egg-hunt-helper',
      name: 'Spring Egg Hunt Helper',
      description: 'Helps you find and track eggs in the Spring Egg Hunt event.',
      url: 'https://greasyfork.org/en/scripts/462034-mousehunt-spring-egg-hunt-helper',
      category: 'userscript',
      tags: ['event', 'seh'],
      source: 'GreasyFork'
    },
    {
      id: 'eggsweeper-helper',
      name: 'Eggsweeper Helper',
      description: 'Helps you with the Spring Egg Hunt Eggsweeper minigame.',
      url: 'https://greasyfork.org/en/scripts/381797-mousehunt-eggsweeper-helper',
      category: 'userscript',
      tags: ['event', 'seh'],
      source: 'GreasyFork'
    },
    {
      id: 'open-all-but-one-kits-spring-eggs',
      name: 'Open "All but One" Kits/Spring Eggs',
      description: 'Adds an open "all but one" button to your kits and spring eggs which have > 2 quantity.',
      url: 'https://greasyfork.org/en/scripts/382479-mousehunt-open-all-but-one-kits-spring-eggs',
      category: 'userscript',
      tags: ['quality-of-life'],
      source: 'GreasyFork'
    },
    {
      id: 'lny-2023-lantern-lighter-colourer',
      name: 'LNY 2023 Lantern Lighter Colourer',
      description: 'Color codes mice on Lantern Lighter maps according to type.',
      url: 'https://greasyfork.org/en/scripts/458463-mousehunt-lny-2023-lantern-lighter-colourer',
      category: 'userscript',
      tags: ['event', 'maps', 'lny'],
      source: 'GreasyFork',
      todo: 'maybe remove @todo',
    },
    {
      id: 'gwh-2022-nice-naughty-map-colour-coder',
      name: 'GWH 2022 Nice/Naughty map colour coder',
      description: 'Color codes mice on Nice/Naughty maps according to type.',
      url: 'https://greasyfork.org/en/scripts/456151-mousehunt-gwh-2022-nice-naughty-map-colour-coder',
      category: 'userscript',
      tags: ['event', 'maps', 'gwh'],
      source: 'GreasyFork',
      todo: 'maybe remove @todo',
    },
    {
      id: 'hween-2021-trick-treat-map-colour-coder',
      name: 'Hween 2021 Trick/Treat map colour coder',
      description: 'Colour codes mice on trick/treat maps according to type.',
      url: 'https://greasyfork.org/en/scripts/433865-mousehunt-hween-2021-trick-treat-map-colour-coder',
      category: 'userscript',
      tags: ['event', 'maps', 'halloween'],
      source: 'GreasyFork',
      todo: 'maybe remove @todo',
    },
    {
      id: 'valour-rift-map-colourer',
      name: 'Valour Rift Map Colourer',
      description: 'Color codes mice on Valour Rift maps according to type.',
      url: 'https://greasyfork.org/en/scripts/462787-mousehunt-valour-rift-map-colourer',
      category: 'userscript',
      tags: ['maps', 'location'],
      locations: ['valour-rift'],
      source: 'GreasyFork',
      todo: 'maybe remove @todo',
    },
    {
      id: 'anytrapanyskin',
      name: 'AnyTrapAnySkin',
      description: 'Turn any trap or skin you own, into a skin for your current setup.',
      url: 'https://greasyfork.org/en/scripts/484756-mh-anytrapanyskin',
      category: 'userscript',
      tags: ['fun'],
      source: 'GreasyFork'
    }
  ];

  return [...items, ...userscripts];
}

async function getLocation(id) {
  return (await getLocations()).find((location) =>
    location.locations.some((innerLocation) => innerLocation.id === id)
  );
}

function getLocations() {
  return [
    {
      id: 'gnawnia',
      name: 'Gnawnia',
      locations: [
        { id: 'meadow', name: 'Meadow' },
        { id: 'town-of-gnawnia', name: 'Town of Gnawnia' },
        { id: 'windmill', name: 'Windmill' },
        { id: 'harbour', name: 'Harbour' },
        { id: 'mountain', name: 'Mountain' },
      ],
    },
    {
      id: 'valour',
      name: 'Valour',
      locations: [
        { id: 'kings-arms', name: 'King\'s Arms' },
        { id: 'tournament-hall', name: 'Tournament Hall' },
        { id: 'kings-gauntlet', name: 'King\'s Gauntlet' },
      ],
    },
    {
      id: 'whisker-woods',
      name: 'Whisker Woods',
      locations: [
        { id: 'calm-clearing', name: 'Calm Clearing' },
        { id: 'great-gnarled-tree', name: 'Great Gnarled Tree' },
        { id: 'lagoon', name: 'Lagoon' },
      ],
    },
    {
      id: 'burroughs',
      name: 'Burroughs',
      locations: [
        { id: 'laboratory', name: 'Laboratory' },
        { id: 'mousoleum', name: 'Mousoleum' },
        { id: 'town-of-digby', name: 'Town of Digby' },
        { id: 'bazaar', name: 'Bazaar' },
        { id: 'toxic-spill', name: 'Toxic Spill' },
      ],
    },
    {
      id: 'furoma',
      name: 'Furoma',
      locations: [
        { id: 'training-grounds', name: 'Training Grounds' },
        { id: 'dojo', name: 'Dojo' },
        { id: 'meditation-room', name: 'Meditation Room' },
        { id: 'pinnacle-chamber', name: 'Pinnacle Chamber' },
      ],
    },
    {
      id: 'bristle-woods',
      name: 'Bristle Woods',
      locations: [
        { id: 'catacombs', name: 'Catacombs' },
        { id: 'acolyte-realm', name: 'Acolyte Realm' },
        { id: 'forbidden-grove', name: 'Forbidden Grove' },
      ],
    },
    {
      id: 'tribal-isles',
      name: 'Tribal Isles',
      locations: [
        { id: 'cape-clawed', name: 'Cape Clawed' },
        { id: 'elub-shore', name: 'Elub Shore' },
        { id: 'nerg-plains', name: 'Nerg Plains' },
        { id: 'derr-dunes', name: 'Derr Dunes' },
        { id: 'jungle-of-dread', name: 'Jungle of Dread' },
        { id: 'dracano', name: 'Dracano' },
        { id: 'balacks-cove', name: 'Balack\'s Cove' },
      ],
    },
    {
      id: 'varmint-valley',
      name: 'Varmint Valley',
      locations: [
        { id: 'claw-shot-city', name: 'Claw Shot City' },
        { id: 'gnawnian-express-station', name: 'Gnawnian Express Station' },
        { id: 'fort-rox', name: 'Fort Rox' },
      ],
    },
    {
      id: 'sandtail-desert',
      name: 'Sandtail Desert',
      locations: [
        { id: 'fiery-warpath', name: 'Fiery Warpath' },
        { id: 'muridae-market', name: 'Muridae Market' },
        { id: 'living-garden', name: 'Living Garden' },
        { id: 'lost-city', name: 'Lost City' },
        { id: 'sand-dunes', name: 'Sand Dunes' },
      ],
    },
    {
      id: 'rodentia',
      name: 'Rodentia',
      locations: [
        { id: 'ss-huntington-iv', name: 'S.S. Huntington IV' },
        { id: 'seasonal-garden', name: 'Seasonal Garden' },
        { id: 'zugzwangs-tower', name: 'Zugzwang\'s Tower' },
        { id: 'crystal-library', name: 'Crystal Library' },
        { id: 'slushy-shoreline', name: 'Slushy Shoreline' },
        { id: 'iceberg', name: 'Iceberg' },
        { id: 'sunken-city', name: 'Sunken City' },
      ],
    },
    {
      id: 'queso-canyon',
      name: 'Queso Canyon',
      locations: [
        { id: 'queso-river', name: 'Queso River' },
        { id: 'prickly-plains', name: 'Prickly Plains' },
        { id: 'cantera-quarry', name: 'Cantera Quarry' },
        { id: 'queso-geyser', name: 'Queso Geyser' },
      ],
    },
    {
      id: 'hollow-heights',
      name: 'Hollow Heights',
      locations: [
        { id: 'fungal-cavern', name: 'Fungal Cavern' },
        { id: 'labyrinth', name: 'Labyrinth' },
        { id: 'zokor', name: 'Zokor' },
        { id: 'moussu-picchu', name: 'Moussu Picchu' },
        { id: 'floating-islands', name: 'Floating Islands' },
      ],
    },
    {
      id: 'folklore-forest',
      name: 'Folklore Forest',
      locations: [
        { id: 'foreword-farm', name: 'Foreword Farm' },
        { id: 'prologue-pond', name: 'Prologue Pond' },
        { id: 'school-of-sorcery', name: 'School of Sorcery' },
        { id: 'bountiful-beanstalk', name: 'Bountiful Beanstalk' },
        { id: 'table-of-contents', name: 'Table of Contents' },
        { id: 'draconic-depths', name: 'Draconic Depths' },
      ],
    },
    {
      id: 'riftopia',
      name: 'Rift Plane',
      locations: [
        { id: 'gnawnia-rift', name: 'Gnawnia Rift' },
        { id: 'burroughs-rift', name: 'Burroughs Rift' },
        { id: 'whisker-woods-rift', name: 'Whisker Woods Rift' },
        { id: 'furoma-rift', name: 'Furoma Rift' },
        { id: 'bristle-woods-rift', name: 'Bristle Woods Rift' },
        { id: 'valour-rift', name: 'Valour Rift' },
      ],
    },
  ];
}

export { getItem, getItems, getItemsByCategory, getItemsByLocation, getLocation, getLocations };
