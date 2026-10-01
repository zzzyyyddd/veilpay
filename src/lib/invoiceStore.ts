import postgres from "postgres";

export type StoredInvoice = {
  invoiceId: string;
  amount: number;
  currency: "ZEC";
  address: string;
  paymentUri: string;
  status: "pending" | "paid";
  createdAt: string;
};

const DATABASE_URL = (() => {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }

  return url;
})();

const sql = postgres(DATABASE_URL, {
  ssl: "require",
});

type InvoiceRow = {
  invoice_id: string;
  amount: number;
  currency: string;
  address: string;
  payment_uri: string;
  status: "pending" | "paid";
  created_at: Date;
};

function mapInvoice(row: InvoiceRow): StoredInvoice {
  return {
    invoiceId: row.invoice_id,
    amount: Number(row.amount),
    currency: "ZEC",
    address: row.address,
    paymentUri: row.payment_uri,
    status: row.status,
    createdAt: row.created_at.toISOString(),
  };
}

export async function getInvoices(): Promise<StoredInvoice[]> {
  const rows = await sql<InvoiceRow[]>`
    SELECT
      invoice_id,
      amount,
      currency,
      address,
      payment_uri,
      status,
      created_at
    FROM invoices
    ORDER BY created_at DESC
  `;

  return rows.map(mapInvoice);
}

export async function saveInvoice(
  invoice: StoredInvoice
): Promise<StoredInvoice> {
  await sql`
    INSERT INTO invoices (
      invoice_id,
      amount,
      currency,
      address,
      payment_uri,
      status,
      created_at
    )
    VALUES (
      ${invoice.invoiceId},
      ${invoice.amount},
      ${invoice.currency},
      ${invoice.address},
      ${invoice.paymentUri},
      ${invoice.status},
      ${invoice.createdAt}
    )
  `;

  return invoice;
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: "pending" | "paid"
): Promise<void> {
  await sql`
    UPDATE invoices
    SET status = ${status}
    WHERE invoice_id = ${invoiceId}
  `;
}
