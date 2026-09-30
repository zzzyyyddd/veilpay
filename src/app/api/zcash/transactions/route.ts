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
        method: "z_listtransactions",
        params: [],
        id: 1,
      }),
      cache: "no-store",
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message ?? "Zcash RPC error");
    }

    return NextResponse.json({
      connected: true,
      transactions: data.result ?? [],
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
