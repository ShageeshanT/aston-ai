export const config = { runtime: "nodejs" };

export default async function handler(_req: Request): Promise<Response> {
  return new Response(
    JSON.stringify({
      ok: true,
      service: "aston",
      phase: 0,
      time: new Date().toISOString(),
    }),
    { headers: { "content-type": "application/json" } },
  );
}
