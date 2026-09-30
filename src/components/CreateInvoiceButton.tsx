"use client";

import { useState } from "react";
import QRCode from "qrcode";

export default function CreateInvoiceButton() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [creating, setCreating] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const [qrCode, setQrCode] = useState("");

  async function createInvoice() {
    try {
      setCreating(true);

      const response = await fetch("/api/invoices/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create invoice");
      }

      const createdInvoice = await response.json();
      setInvoice(createdInvoice);

      const qrDataUrl = await QRCode.toDataURL(createdInvoice.paymentUri, {
        width: 240,
        margin: 2,
      });

      setQrCode(qrDataUrl);
    } catch (error) {
      console.error("Create invoice failed:", error);
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
      >
        + Create Invoice
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101419] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Create Invoice
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Request a private Zcash payment.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xl text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-6">
              <label
                htmlFor="amount"
                className="text-sm font-medium text-zinc-300"
              >
                Amount
              </label>

              <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-black/30 px-4">
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.10"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full bg-transparent py-3 text-white outline-none placeholder:text-zinc-700"
                />
                <span className="text-sm font-medium text-zinc-500">ZEC</span>
              </div>
            </div>

            {invoice && (
              <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
                  Invoice created
                </p>

                {qrCode && (
                  <div className="mt-4 flex justify-center">
                    <div className="rounded-xl bg-white p-3">
                      <img
                        src={qrCode}
                        alt={`Payment QR for ${invoice.invoiceId}`}
                        width={240}
                        height={240}
                      />
                    </div>
                  </div>
                )}

                <p className="mt-4 font-mono text-sm text-white">
                  {invoice.invoiceId}
                </p>

                <p className="mt-2 text-lg font-semibold text-white">
                  {Number(invoice.amount).toFixed(2)} ZEC
                </p>

                <div className="mt-3 break-all rounded-lg bg-black/30 p-3 font-mono text-xs text-zinc-400">
                  {invoice.paymentUri}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createInvoice}
                disabled={!amount || Number(amount) <= 0 || creating}
                className="flex-1 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {creating ? "Creating..." : "Create Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
