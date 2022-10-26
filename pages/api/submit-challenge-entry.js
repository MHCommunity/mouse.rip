const { Client } = require('@notionhq/client')

const notion = new Client({
  auth: process.env.INTEGRATION_NOTION_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: `${req.method} requests are not allowed` })
  }
  try {
    const { challengeType, hunterId, discordId } = JSON.parse(req.body)
    await notion.pages.create({
      parent: {
        database_id: process.env.INTEGRATION_NOTION_DATABASE_ID,
      },
      properties: {
        HunterID: {
          title: [
            {
              text: {
                content: hunterId,
              },
            },
          ],
        },
        DiscordID: {
          rich_text: [
            {
              text: {
                content: discordId,
              },
            },
          ],
        },
        Challenge: {
          rich_text: [
            {
              text: {
                content: challengeType,
              },
            },
          ],
        },
      },
    })
    res.status(201).json({ success: true, message: 'You have successfully entered the challenge.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'There was an error submitting your entry.', error: error.message })
  }
}
