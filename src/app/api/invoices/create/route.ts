import { NextResponse } from "next/server";
import { saveInvoice } from "@/lib/invoiceStore";

const MERCHANT_ADDRESS =
  process.env.ZCASH_MERCHANT_ADDRESS ?? "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid ZEC amount" },
        { status: 400 }
      );
    }

    const invoiceId = `VEILPAY-${Date.now()}`;

    const params = new URLSearchParams({
      amount: amount.toFixed(8),
      memo: invoiceId,
      message: `VeilPay invoice ${invoiceId}`,
    });

    const paymentUri = `zcash:${MERCHANT_ADDRESS}?${params.toString()}`;

    const invoice = await saveInvoice({
      invoiceId,
      amount,
      currency: "ZEC",
      address: MERCHANT_ADDRESS,
      paymentUri,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(invoice);
  } catch {
    return NextResponse.json(
      { error: "Unable to create invoice" },
      { status: 500 }
    );
  }
}
