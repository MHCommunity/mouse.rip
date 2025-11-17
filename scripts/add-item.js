import fs from 'fs';
import path from 'path';
import {
  cancel,
  group,
  intro,
  isCancel,
  outro,
  multiselect,
  confirm,
  select,
  text
} from '@clack/prompts';
import locations from '../src/data/locations.json' assert { type: 'json' };

async function addItem() {
  intro('Add New Item');

  try {
    const item = await group({
      title: () => text({
        message: 'What is the title of the item?',
        placeholder: 'Enter item title...',
        required: true,
        validate: (value) => {
          if (!value || value.trim() === '') {
            return 'Title cannot be empty.';
          }
        }
      }),
      url: () => text({
        message: 'What is the URL of the item?',
        placeholder: 'https://example.com',
      }),
      description: () => text({
        message: 'Enter a description (optional):',
        placeholder: 'Brief description of the item...',
      }),
      source: ({ results }) => {
        let initialValue = '';
        if (results.url) {
          try {
            const urlObj = new URL(results.url);
            initialValue = urlObj.hostname.replace(/^www\./, '').replace(/\..+$/, '').replace(/^\w/, c => c.toUpperCase());
          } catch {}
        }

        return text({
          message: 'What is the source of this item?',
          placeholder: "Google Sheets, Reddit, etc.",
          initialValue,
        });
      },
      category: () => select({
        message: 'What category is this item?',
        options: [
          { value: 'tool', label: 'Tool' },
          { value: 'guide', label: 'Guide' },
          { value: 'spreadsheet', label: 'Spreadsheet' },
          { value: 'extension', label: 'Extension' },
          { value: 'userscript', label: 'Userscript' },
          { value: 'other', label: 'Other' },
        ],
      }),
      regions: () => multiselect({
        message: 'Select regions for this item (optional):',
        options: locations.map(location => ({
          value: location.id,
          label: location.name,
        })),
        required: false,
      }),
    }, {
      onCancel: () => {
        cancel('Cancelled adding item.');
        process.exit(0);
      }
    });

    // if they selected any regions, then we want to prompt for the locations inside the regions
    if (item.regions.length > 0) {
      const selectedLocations = [];
      for (const regionId of item.regions) {
        const region = locations.find(loc => loc.id === regionId);
        if (region && region.locations && region.locations.length > 0) {
          const locationOptions = [
            { value: 'all', label: `All locations in ${region.name}` },
            ...region.locations.map(location => ({
              value: location.id,
              label: location.name,
            })),
          ];

          const selectedRegionLocations = await multiselect({
            message: `Select locations in ${region.name} (optional):`,
            options: locationOptions,
          });

          // If 'all' is selected, add all location IDs from this region
          if (selectedRegionLocations.includes('all')) {
            selectedLocations.push(...region.locations.map(loc => loc.id));
          } else {
            selectedLocations.push(...selectedRegionLocations);
          }
        }
      }
      // If any locations were selected, add them to the item
      if (selectedLocations.length > 0) {
        item.locations = selectedLocations;
      }
    }

    // add tags only for userscripts
    let tags = [];
    if ('userscript' === item.category) {
      const tagsInput = await text({
        message: 'Enter tags (comma-separated, optional):',
        placeholder: 'tag1, tag2, tag3',
        initialValue: '',
      });

      if (isCancel(tagsInput)) {
        cancel('Operation cancelled.');
        process.exit(0);
      }

      tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    const newItem = {
      id: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      name: item.title,
      description: item.description ? (item.description.endsWith('.') ? item.description : item.description + '.') : '',
      url: item.url,
      source: item.source || '',
      category: item.category,
    };

    // if we have locations, add them to the item
    if (item.locations && item.locations.length > 0) {
      newItem.locations = item.locations;
    }

    // if we have tags, add them to the item
    if (tags.length > 0) {
      newItem.tags = tags;
    }

    // confirm the item details
    const confirmMessage = `Is this correct?
${JSON.stringify(newItem, null, 2)}`;
    const confirmed = await confirm({
      message: confirmMessage,
      initialValue: true,
    });

    if (isCancel(confirmed) || !confirmed) {
      cancel('Item not added.');
      process.exit(0);
    }

    item.dateAdded = new Date().toISOString();

    const itemsPath = 'userscript' === item.category
      ? path.join('src', 'data', 'userscripts.json')
      : path.join('src', 'data', 'items.json');

    // Read existing items or create empty array
    let items = [];
    if (fs.existsSync(itemsPath)) {
      const fileContent = fs.readFileSync(itemsPath, 'utf8');
      items = JSON.parse(fileContent);
    } else {
      const dataDir = path.dirname(itemsPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    }

    items.push(newItem);
    fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2));

    outro(`✅ Item "${item.title}" added successfully! (ID: ${newItem.id})`);

  } catch (error) {
    cancel(`Error adding item: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
addItem();
