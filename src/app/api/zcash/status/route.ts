import { NextResponse } from "next/server";

const ZCASH_RPC_URL = (() => {
  const url = process.env.ZCASH_RPC_URL;

  if (!url) {
    throw new Error("ZCASH_RPC_URL is not configured");
  }

  return url;
})();

export async function GET() {
  try {
    const response = await fetch(ZCASH_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getblockchaininfo",
        params: [],
        id: 1,
      }),
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json({
      connected: true,
      network: data.result?.chain,
      blocks: data.result?.blocks,
    });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
