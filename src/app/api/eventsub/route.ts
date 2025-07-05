import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = process.env.WEBHOOK_SECRET_KEY!;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL!;

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad Request: JSON non valido', { status: 400 });
  }

  // Rispondi alla challenge per la verifica webhook
  if (body.challenge) {
    return new Response(body.challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const eventType = body.subscription?.type ?? 'evento sconosciuto';
  const event = body.event ?? {};

  console.log(`📨 Evento Twitch ricevuto: ${eventType}`);
  console.log(JSON.stringify(event, null, 2));

  // Costruisco un contenuto più leggibile, controllando campi importanti
  let content = `📣 Evento Twitch: \`${eventType}\`\n`;

  if (eventType === 'channel.ban') {
    const bannedUser = event.user_name || 'utente sconosciuto';
    const broadcaster = event.broadcaster_user_name || 'canale sconosciuto';
    const reason = event.reason || 'nessun motivo specificato';
    content += `⛔ **${bannedUser}** è stato bannato dal canale **${broadcaster}**.\nMotivo: ${reason}\n`;
  } else {
    // Per altri eventi, dump JSON
    content += '```\n' + JSON.stringify(event, null, 2) + '\n```';
  }

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    console.log('➡️ Notifica inviata a Discord');
  } catch (error) {
    console.error('❌ Errore invio a Discord:', error);
  }

  return new Response(null, { status: 204 });
}

export async function GET() {
  return NextResponse.json({ error: 'Usa POST' }, { status: 405 });
}
