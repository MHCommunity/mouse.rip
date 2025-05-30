import fs from 'node:fs';
import path from 'node:path';

import userscriptsData from '../src/data/userscripts.json';

const updateUserScripts = async () => {
  console.log(`Updating ${userscriptsData.length} userscripts...`); // eslint-disable-line no-console

  const userscripts = userscriptsData;

  for (const script of userscripts) {
    if (! script.url.includes('https://greasyfork.org/en/scripts/')) {
      return;
    }

    const scriptId = script.url.replace('https://greasyfork.org/en/scripts/', '');
    const apiUrl = `https://api.greasyfork.org/en/scripts/${scriptId}.json`;

    console.log(`Updating script ID ${scriptId}...`); // eslint-disable-line no-console
    const scriptData = await fetch(apiUrl);
    if (! scriptData.ok) {
      console.error(`Failed to fetch data for script ID ${script.id}`); // eslint-disable-line no-console
      return;
    }

    const scriptJson = await scriptData.json();
    if (! scriptJson) {
      console.error(`Failed to parse JSON for script ID ${script.id}`); // eslint-disable-line no-console
      return;
    }

    const updateDataUrl = `https://greasyfork.org/en/scripts/${scriptId}/stats.json`;
    const updateData = await fetch(updateDataUrl);
    if (! updateData.ok) {
      console.error(`Failed to fetch update data for script ID ${script.id}`); // eslint-disable-line no-console
      return;
    }

    const updateJson = await updateData.json();
    if (! updateJson) {
      console.error(`Failed to parse update JSON for script ID ${script.id}`); // eslint-disable-line no-console
      return;
    }

    let updateDates = Object.keys(updateJson);
    const last7Days = updateDates.slice(-7);
    const totalUpdateChecks = last7Days.reduce((sum, date) => {
      const dayData = updateJson[date];
      return sum + (dayData.update_checks || 0);
    }, 0);

    const avg = totalUpdateChecks / last7Days.length;

    // Adjustment factor to account for users who check weekly.
    const adjustmentFactor = 1.87;
    const estimatedActiveUsers = Math.round(avg * adjustmentFactor);

    updateDates = Object.keys(updateJson);
    const last3Months = updateDates.slice(-90);
    const installsLast3Months = last3Months.reduce((sum, date) => {
      const dayData = updateJson[date];
      return sum + (dayData.installs || 0);
    }, 0);

    updateDates = Object.keys(updateJson);
    const lastMonth = updateDates.slice(-30);
    const installsLastMonth = lastMonth.reduce((sum, date) => {
      const dayData = updateJson[date];
      return sum + (dayData.installs || 0);
    }, 0);

    // Find the script in the userscripts array
    const scriptIndex = userscripts.findIndex((s) => s.id === script.id);
    if (scriptIndex === -1) {
      console.error(`Script ID ${script.id} not found in userscripts array`); // eslint-disable-line no-console
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
        installs_last_3_months: installsLast3Months,
        installs_last_month: installsLastMonth,
        created_at: scriptJson.created_at,
        updated_at: scriptJson.code_updated_at,
        version: scriptJson.version,
        author: scriptAuthor,
      }
    };

    const filePath = path.join(__dirname, '../src/data/userscripts.json');
    fs.writeFileSync(filePath, JSON.stringify(userscripts, null, 2), 'utf-8');
  }

  console.log(`Updated ${userscripts.length} userscripts.`); // eslint-disable-line no-console
};

updateUserScripts();
