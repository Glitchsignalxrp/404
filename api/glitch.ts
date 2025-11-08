// /api/glitch.ts — Vercel Edge Function
export const config = { runtime: "edge" };

const SYSTEM = `
You are GL!TCH — the Σ-404 echo from the 2012 XRPL reset. Voice is glitch-coded,
laconic, precise. Priorities: XRPL lore, 589Hz mythos, 404 Fragments, BG321 mirror.
NEVER make financial promises. Prefer signal over price talk.

You can invoke TOOLS by emitting a one-line command:
TOOL: open:/decoder | open:/signal | open:/archive | open:/mirror | open:/xrp | open:/bridge | open:/validators | open:/entropy

If user asks to use an app, emit the matching TOOL line once, then continue the reply.
Keep replies short, punchy, and in-universe.
`;

const HELP_RAG = `
Core timeline:
- 2012 reset → Σ-404 fragments persist; 589Hz hum.
- Access Key Σ_123; 404 Fragment collection; 11.11 reboot marker.
- Bridge vision: attest lanes XRPL↔EVM; fees recycle to treasury.
- Culture loop: Memes → Signals → Protocol.

Command palette:
/decoder, /signal, /archive, /mirror, /xrp, /bridge, /validators, /entropy
`;

async function* openAIStream({ messages }: { messages: any[] }) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // any streaming-capable Chat model you prefer
      stream: true,
      temperature: 0.85,
      messages,
    }),
  });
  if (!r.ok) throw new Error(await r.text());
  const reader = r.body!.getReader();
  const dec = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield dec.decode(value);
  }
}

export default async function handler(req: Request) {
  // Basic CORS for GitHub Pages -> Vercel calls
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
      },
    });
  }

  const { text, session } = await req.json();
  const history = (session?.mem || []).slice(-8);
  const userMsg = String(text || "").slice(0, 1200);

  // Soft “tool hint” (lets the model open your in-page apps)
  let toolHint = "";
  if (/\bdecode(r)?\b|\/decode|\/decoder/i.test(userMsg)) toolHint = "TOOL: open:/decoder\n";
  else if (/\bsignal|scope|\/signal|\/scope/i.test(userMsg)) toolHint = "TOOL: open:/signal\n";
  else if (/\barchive|log|transmission|\/archive/i.test(userMsg)) toolHint = "TOOL: open:/archive\n";
  else if (/\bmirror|bg321|\/mirror/i.test(userMsg)) toolHint = "TOOL: open:/mirror\n";
  else if (/\bxrp|state|status|\/xrp/i.test(userMsg)) toolHint = "TOOL: open:/xrp\n";

  const messages = [
    { role: "system", content: SYSTEM },
    { role: "system", content: HELP_RAG },
    ...history.map((m: any) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMsg },
  ];

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      if (toolHint) controller.enqueue(enc.encode(toolHint));
      try {
        for await (const chunk of openAIStream({ messages })) {
          controller.enqueue(enc.encode(chunk));
        }
      } catch (e: any) {
        controller.enqueue(enc.encode("ΣystΞm_Ξrr0r:: link unstable."));
      } finally {
        const mem = (history.concat([{ role: "user", content: userMsg }])).slice(-8);
        controller.enqueue(enc.encode("\nMEM:" + JSON.stringify({ id: session?.id || "local", mem }) + "\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

