import fs from 'node:fs';
import path from 'node:path';

import userscriptsData from '../src/data/userscripts.json';

/* eslint-disable no-console */
const updateUserScripts = async () => {
  console.log(`Updating ${userscriptsData.length} user scripts...`);

  const userscripts = userscriptsData;

  for (const script of userscripts) {
    // https://api.greasyfork.org/en/scripts/381219-mousehunt-wisdom-stats.json
    // https://greasyfork.org/en/scripts/484756-mh-anytrapanyskin
    if (! script.url.includes('https://greasyfork.org/en/scripts/')) {
      return;
    }

    console.log(`Updating ${script.name}...`);

    const scriptId = script.url.replace('https://greasyfork.org/en/scripts/', '');
    const apiUrl = `https://api.greasyfork.org/en/scripts/${scriptId}.json`;

    const scriptData = await fetch(apiUrl);
    if (! scriptData.ok) {
      console.error(`Failed to fetch data for script ID ${script.id}`);
      return;
    }

    const scriptJson = await scriptData.json();
    if (! scriptJson) {
      console.error(`Failed to parse JSON for script ID ${script.id}`);
      return;
    }

    const updateDataUrl = `https://greasyfork.org/en/scripts/${scriptId}/stats.json`;
    const updateData = await fetch(updateDataUrl);
    if (! updateData.ok) {
      console.error(`Failed to fetch update data for script ID ${script.id}`);
      return;
    }

    const updateJson = await updateData.json();
    if (! updateJson) {
      console.error(`Failed to parse update JSON for script ID ${script.id}`);
      return;
    }

    // Get the last 7 days of data
    const updateDates = Object.keys(updateJson).sort(); // sort ascending
    const last7Days = updateDates.slice(-7);

    // Sum update_checks for the last 7 days
    const totalUpdateChecks = last7Days.reduce((sum, date) => {
      const dayData = updateJson[date];
      return sum + (dayData.update_checks || 0);
    }, 0);

    const avg = totalUpdateChecks / last7Days.length;

    // Adjustment factor to account for users who check weekly.
    const adjustmentFactor = 1.87;
    const estimatedActiveUsers = Math.round(avg * adjustmentFactor);

    // Find the script in the userscripts array
    const scriptIndex = userscripts.findIndex((s) => s.id === script.id);
    if (scriptIndex === -1) {
      console.error(`Script ID ${script.id} not found in userscripts array`);
      return;
    }

    const scriptAuthor = scriptJson.users.map((author) => {
      return {
        name: author.name,
        url: author.url,
      };
    });

    userscripts[scriptIndex] = {
      ...userscripts[scriptIndex],
      data: {
        name: scriptJson.name,
        description: scriptJson.description,
        installs: scriptJson.total_installs,
        active_users: estimatedActiveUsers,
        created_at: scriptJson.created_at,
        updated_at: scriptJson.code_updated_at,
        version: scriptJson.version,
        author: scriptAuthor,
      }
    };

    console.log(`Updated ${script.name} with ${estimatedActiveUsers} active users.`);
  }

  // Write the updated data back to the JSON file
  const filePath = path.join(__dirname, '../src/data/userscripts.json');
  fs.writeFileSync(filePath, JSON.stringify(userscripts, null, 2), 'utf-8');
  console.log(`Updated ${userscripts.length} user scripts.`);
};

/* eslint-enable no-console */
updateUserScripts();
