import { NextResponse } from "next/server";
import { saveInvoice } from "@/lib/invoiceStore";

const MERCHANT_ADDRESS =
  "uregtest10mfyhxlm9xvffe9x463rr243wu96zqyu9lj6750j05740t36qs2ycmu6z6rej3mw76c7sfmckcf7aygqlckgthfwcuhu5l76d9a2vtdn6fmpql8w7m8p0ssqj3hnauhy2lag9lfyyzwkupp0k7r033rztx68su0v9q0fp25xrudlr9hj37jxjg9a9vurnfxgzqhw80xye2w7ywgganj";

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
