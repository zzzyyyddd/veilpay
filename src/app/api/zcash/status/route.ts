import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://127.0.0.1:8181", {
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
