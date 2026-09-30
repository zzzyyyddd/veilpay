import { NextResponse } from "next/server";
import {
  getInvoices,
  updateInvoiceStatus,
} from "@/lib/invoiceStore";

const MERCHANT_ACCOUNT = "ebea6756-720d-4134-ae39-632bc58b82b5";

export async function GET() {
  try {
    const storedInvoices = await getInvoices();

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

    const transactions = data.result ?? [];

    const invoices = await Promise.all(
      storedInvoices.map(async (invoice) => {
        const payment = transactions.find((tx: any) => {
          if (
            tx.account_uuid !== MERCHANT_ACCOUNT ||
            tx.account_balance_delta <= 0
          ) {
            return false;
          }

          return (tx.outputs ?? []).some(
            (output: any) =>
              output.to_account === MERCHANT_ACCOUNT &&
              output.memo === invoice.invoiceId &&
              output.value === Math.round(invoice.amount * 100000000)
          );
        });

        if (payment) {
          const status = payment.mined_height === null ? "pending" : "paid";

          if (invoice.status !== status) {
            await updateInvoiceStatus(invoice.invoiceId, status);
          }

          return {
            ...invoice,
            status,
            txid: payment.txid,
            minedHeight: payment.mined_height,
          };
        }

        return {
          ...invoice,
          status: "pending",
          txid: null,
          minedHeight: null,
        };
      })
    );

    return NextResponse.json({
      connected: true,
      invoices,
    });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        invoices: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
