import { readFile } from "node:fs/promises";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not available in production." }, { status: 404 });
  }

  try {
    const raw = await readFile("/tmp/veilpay-browser-fixture.json", "utf8");
    return Response.json(JSON.parse(raw));
  } catch {
    return Response.json({ error: "Test fixture unavailable." }, { status: 404 });
  }
}
