import { promises as fs } from "fs";
import path from "path";

export type StoredInvoice = {
  invoiceId: string;
  amount: number;
  currency: "ZEC";
  address: string;
  paymentUri: string;
  status: "pending" | "paid";
  createdAt: string;
};

const INVOICE_FILE = path.join(process.cwd(), "data", "invoices.json");

export async function getInvoices(): Promise<StoredInvoice[]> {
  const data = await fs.readFile(INVOICE_FILE, "utf8");
  return JSON.parse(data);
}

export async function saveInvoice(
  invoice: StoredInvoice
): Promise<StoredInvoice> {
  const invoices = await getInvoices();

  invoices.unshift(invoice);

  await fs.writeFile(
    INVOICE_FILE,
    JSON.stringify(invoices, null, 2),
    "utf8"
  );

  return invoice;
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: "pending" | "paid"
): Promise<void> {
  const invoices = await getInvoices();

  const updated = invoices.map((invoice) =>
    invoice.invoiceId === invoiceId
      ? { ...invoice, status }
      : invoice
  );

  await fs.writeFile(
    INVOICE_FILE,
    JSON.stringify(updated, null, 2),
    "utf8"
  );
}
