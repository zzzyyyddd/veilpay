"use client";

import { useEffect, useState } from "react";

type InvoiceData = {
  invoiceId: string;
  amount: number;
  createdAt: string;
  status: "pending" | "paid";
  txid: string | null;
  minedHeight: number | null;
};

export default function LiveDashboard() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [receipt, setReceipt] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadInvoices() {
    try {
      const response = await fetch("/api/invoices/detect", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load invoices");
      }

      const data = await response.json();
      setInvoices(data.invoices ?? []);
      setError(null);
    } catch (error) {
      console.error("Invoice refresh failed:", error);
      setError(
        error instanceof Error ? error.message : "Unable to load invoices"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();

    const interval = window.setInterval(loadInvoices, 3000);

    return () => window.clearInterval(interval);
  }, []);

  const totalReceived = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((total, invoice) => total + invoice.amount, 0);

  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === "paid"
  ).length;

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status === "pending"
  ).length;

  return (
    <>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total received"
          value={`${totalReceived.toFixed(2)} ZEC`}
        />
        <StatCard label="Paid invoices" value={String(paidInvoices)} />
        <StatCard label="Pending invoices" value={String(pendingInvoices)} />
      </div>

      <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h3 className="font-semibold">Recent invoices</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Shielded Zcash payment activity
            </p>
          </div>

          <span
            className={`rounded-full border px-3 py-1 text-xs ${
              error
                ? "border-red-400/20 bg-red-400/10 text-red-300"
                : loading
                  ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                  : "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
            }`}
          >
            {error
              ? "Connection error"
              : loading
                ? "Connecting..."
                : "Live · Zcash Regtest"}
          </span>
        </div>

        <div className="divide-y divide-white/10">
          {invoices.map((invoice) => (
            <Invoice
              key={invoice.invoiceId}
              invoice={invoice}
              onViewReceipt={() => setReceipt(invoice)}
            />
          ))}
        </div>
      </section>

      {receipt && (
        <ReceiptModal
          invoice={receipt}
          onClose={() => setReceipt(null)}
        />
      )}
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Invoice({
  invoice,
  onViewReceipt,
}: {
  invoice: InvoiceData;
  onViewReceipt: () => void;
}) {
  const paid = invoice.status === "paid";

  return (
    <div className="grid gap-4 px-6 py-5 sm:grid-cols-5 sm:items-center">
      <div>
        <p className="font-mono text-sm">{invoice.invoiceId}</p>
        <p className="mt-1 text-xs text-zinc-600">Private invoice</p>
      </div>

      <p className="font-medium">{invoice.amount.toFixed(2)} ZEC</p>

      <div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
            paid
              ? "bg-emerald-400/10 text-emerald-400"
              : "bg-amber-400/10 text-amber-300"
          }`}
        >
          {paid ? "Paid" : "Pending"}
        </span>
      </div>

      <p className="text-sm text-zinc-500">
        {invoice.minedHeight
          ? `Block ${invoice.minedHeight}`
          : "Waiting for confirmation"}
      </p>

      <div className="sm:text-right">
        {paid && (
          <button
            type="button"
            onClick={onViewReceipt}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-emerald-400/30 hover:text-emerald-400"
          >
            View receipt
          </button>
        )}
      </div>
    </div>
  );
}

function ReceiptModal({
  invoice,
  onClose,
}: {
  invoice: InvoiceData;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#101419] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-emerald-400">Payment confirmed</p>
            <h3 className="mt-1 text-xl font-semibold">Payment Receipt</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-sm text-zinc-500 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <ReceiptRow label="Invoice" value={invoice.invoiceId} />
          <ReceiptRow
            label="Amount"
            value={`${invoice.amount.toFixed(8)} ZEC`}
          />
          <ReceiptRow label="Status" value="Paid" />
          <ReceiptRow
            label="Created"
            value={new Date(invoice.createdAt).toLocaleString()}
          />
          <ReceiptRow
            label="Block"
            value={String(invoice.minedHeight ?? "Pending")}
          />

          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Transaction ID
            </p>
            <p className="mt-2 break-words font-mono text-xs leading-relaxed text-zinc-300">
              {invoice.txid ?? "Pending"}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.05] p-4">
          <p className="text-sm text-zinc-400">
            Shielded Zcash payment confirmed for this invoice.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-white/5 pb-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-right font-mono text-sm text-zinc-300">{value}</p>
    </div>
  );
}
