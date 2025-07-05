import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = process.env.WEBHOOK_SECRET_KEY!;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL!;

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.challenge) {
    return new Response(body.challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const eventType = body.subscription?.type;
  const event = body.event;

  console.log(`📨 Evento Twitch ricevuto: ${eventType}`);
  console.log(JSON.stringify(event, null, 2));

  const content = `📣 Evento Twitch: \`${eventType}\`\n\`\`\`json\n${JSON.stringify(event, null, 2)}\n\`\`\``;
  await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  return new Response(null, { status: 204 });
}

export async function GET() {
  return NextResponse.json({ error: 'Usa POST' }, { status: 405 });
}
