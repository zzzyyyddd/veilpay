import { NextRequest, NextResponse } from "next/server";
import { getInvoices } from "@/lib/invoiceStore";

type ListTransactionOutput = {
  pool?: string;
  output_index?: number;
  to_account?: string;
  value?: number;
  is_change?: boolean;
  memo?: string;
};

type ListTransaction = {
  account_uuid?: string;
  account_balance_delta?: number;
  txid?: string;
  mined_height?: number | null;
  outputs?: ListTransactionOutput[];
};

type ViewedOutput = {
  pool?: string;
  action?: number;
  account_uuid?: string;
  outgoing?: boolean;
  walletInternal?: boolean;
  valueZat?: number;
  memoStr?: string;
};

type ViewedTransaction = {
  txid?: string;
  status?: string;
  outputs?: ViewedOutput[];
};

const MERCHANT_ACCOUNT = (() => {
  const account = process.env.ZCASH_MERCHANT_ACCOUNT;

  if (!account) {
    throw new Error("ZCASH_MERCHANT_ACCOUNT is not configured");
  }

  return account;
})();

const ZCASH_RPC_URL = (() => {
  const url = process.env.ZCASH_RPC_URL;

  if (!url) {
    throw new Error("ZCASH_RPC_URL is not configured");
  }

  return url;
})();

async function rpc(method: string, params: unknown[] = []) {
  const response = await fetch(ZCASH_RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Zcash RPC HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message ?? `Zcash RPC error: ${method}`);
  }

  return data.result;
}

export async function GET(request: NextRequest) {
  try {
    const invoiceId = request.nextUrl.searchParams.get("invoiceId");

    if (!invoiceId) {
      return NextResponse.json(
        {
          error: "invoiceId is required",
        },
        { status: 400 }
      );
    }

    const invoices = await getInvoices();
    const invoice = invoices.find((item) => item.invoiceId === invoiceId);

    if (!invoice) {
      return NextResponse.json(
        {
          error: "Invoice not found",
        },
        { status: 404 }
      );
    }

    const expectedValueZat = Math.round(invoice.amount * 100000000);

    const transactions = (await rpc(
      "z_listtransactions"
    )) as ListTransaction[];

    const paymentTransaction = transactions.find(
      (tx) =>
        tx.account_uuid === MERCHANT_ACCOUNT &&
        (tx.account_balance_delta ?? 0) > 0 &&
        (tx.outputs ?? []).some(
          (output) =>
            output.pool === "ironwood" &&
            output.to_account === MERCHANT_ACCOUNT &&
            output.value === expectedValueZat &&
            output.is_change === false &&
            output.memo === invoice.invoiceId
        )
    );

    if (!paymentTransaction?.txid) {
      return NextResponse.json(
        {
          error: "Confirmed payment transaction not found",
        },
        { status: 404 }
      );
    }

    const listedOutput = paymentTransaction.outputs?.find(
      (output) =>
        output.pool === "ironwood" &&
        output.to_account === MERCHANT_ACCOUNT &&
        output.value === expectedValueZat &&
        output.is_change === false &&
        output.memo === invoice.invoiceId
    );

    if (listedOutput?.output_index === undefined) {
      throw new Error("Ironwood output index missing from transaction");
    }

    const viewedTransaction = (await rpc("z_viewtransaction", [
      paymentTransaction.txid,
    ])) as ViewedTransaction;

    const viewedOutput = viewedTransaction.outputs?.find(
      (output) =>
        output.pool === "ironwood" &&
        output.account_uuid === MERCHANT_ACCOUNT &&
        output.walletInternal === false &&
        output.valueZat === expectedValueZat &&
        output.memoStr === invoice.invoiceId
    );

    if (viewedOutput?.action === undefined) {
      throw new Error("Exact Ironwood action not found");
    }

    if (viewedOutput.action !== listedOutput.output_index) {
      throw new Error(
        `Ironwood action mismatch: list=${listedOutput.output_index}, view=${viewedOutput.action}`
      );
    }

    const rawTxHex = (await rpc("getrawtransaction", [
      paymentTransaction.txid,
    ])) as string;

    if (!rawTxHex || typeof rawTxHex !== "string") {
      throw new Error("Raw transaction hex not available");
    }

    return NextResponse.json({
      invoiceId: invoice.invoiceId,
      amount: invoice.amount,
      currency: invoice.currency,
      network: "regtest",
      pool: "ironwood",
      txId: paymentTransaction.txid,
      outputIndex: viewedOutput.action,
      rawTxHex,
    });
  } catch (error) {
    console.error("Proof metadata error:", error);
    return NextResponse.json(
      {
        error: "Unable to prepare proof metadata.",
      },
      { status: 500 }
    );
  }
}