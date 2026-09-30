"use client";

import { useEffect, useState } from "react";

type InvoiceData = {
  invoiceId: string;
  amount: number;
  status: "pending" | "paid";
  txid: string | null;
  minedHeight: number | null;
};

export default function LiveDashboard() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);

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
    } catch (error) {
      console.error("Invoice refresh failed:", error);
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

          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-400">
            Live · Zcash Regtest
          </span>
        </div>

        <div className="divide-y divide-white/10">
          {invoices.map((invoice) => (
            <Invoice
              key={invoice.invoiceId}
              id={invoice.invoiceId}
              amount={`${invoice.amount.toFixed(2)} ZEC`}
              status={invoice.status === "paid" ? "Paid" : "Pending"}
              confirmations={
                invoice.minedHeight
                  ? `Mined at block ${invoice.minedHeight}`
                  : "Waiting for confirmation"
              }
            />
          ))}
        </div>
      </section>
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
  id,
  amount,
  status,
  confirmations,
}: {
  id: string;
  amount: string;
  status: "Paid" | "Pending";
  confirmations: string;
}) {
  const paid = status === "Paid";

  return (
    <div className="grid gap-4 px-6 py-5 sm:grid-cols-4 sm:items-center">
      <div>
        <p className="font-mono text-sm">{id}</p>
        <p className="mt-1 text-xs text-zinc-600">Private invoice</p>
      </div>

      <p className="font-medium">{amount}</p>

      <div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
            paid
              ? "bg-emerald-400/10 text-emerald-400"
              : "bg-amber-400/10 text-amber-300"
          }`}
        >
          {status}
        </span>
      </div>

      <p className="text-sm text-zinc-500 sm:text-right">{confirmations}</p>
    </div>
  );
}
