import postgres from "postgres";
import { resolve4 } from "node:dns/promises";

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


async function createDatabaseClient() {
  const url = new URL(DATABASE_URL);
  const addresses = await resolve4(url.hostname);
  let lastError: unknown;

  for (const address of addresses) {
    const sql = postgres({
      host: address,
      port: Number(url.port) || 5432,
      database: url.pathname.slice(1),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      ssl: {
        servername: url.hostname,
        rejectUnauthorized: true,
      },
      connect_timeout: 5,
      max: 1,
    });

    try {
      await sql`SELECT 1`;
      return sql;
    } catch (error) {
      lastError = error;
      await sql.end({ timeout: 1 }).catch(() => {});
    }
  }

  throw lastError ?? new Error("Unable to connect to database");
}

const sqlPromise = createDatabaseClient();

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
  const sql = await sqlPromise;

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
  const sql = await sqlPromise;

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
  const sql = await sqlPromise;

  await sql`
    UPDATE invoices
    SET status = ${status}
    WHERE invoice_id = ${invoiceId}
  `;
}
