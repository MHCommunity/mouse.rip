const { Client } = require('@notionhq/client')

export async function onRequestPost({ request, env }) {

  const notion = new Client({
    auth: env.INTEGRATION_NOTION_API_KEY,
  })

  try {
    let input = await request.formData();

    input = Object.fromEntries(input);
    const { challengeType, hunterId, discordId } = input;

    return new Response(
      JSON.stringify(input),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

    await notion.pages.create({
      parent: {
        database_id: env.INTEGRATION_NOTION_DATABASE_ID,
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

    return new Response(
      JSON.stringify({ success: true, message: 'You have successfully entered the challenge.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'There was an error submitting your entry.', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
