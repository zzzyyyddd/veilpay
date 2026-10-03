"use client";

import { useState } from "react";
import { createPrivateReceipt, verifyPrivateReceipt } from "@/lib/private-receipt/client";

type ProofMetadata = {
  invoiceId: string;
  amount: number;
  currency: "ZEC";
  network: "mainnet" | "testnet" | "regtest";
  pool: "orchard" | "ironwood";
  txId: string;
  outputIndex: number;
  rawTxHex: string;
};

export default function PrivateReceiptGenerator() {
  const [invoiceId, setInvoiceId] = useState("");
  const [metadata, setMetadata] = useState<ProofMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ovkHex, setOvkHex] = useState("");
  const [receipt, setReceipt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [verification, setVerification] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function loadPayment() {
    const id = invoiceId.trim();

    if (!id) {
      setError("Enter an invoice ID.");
      return;
    }

    setLoading(true);
    setError("");
    setMetadata(null);

    try {
      const response = await fetch(
        `/api/proof/metadata?invoiceId=${encodeURIComponent(id)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load payment.");
      }

      setMetadata(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load payment.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTestFixture() {
    setLoading(true);
    setError("");
    setMetadata(null);
    setReceipt("");

    try {
      const response = await fetch("/api/proof/test-fixture");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load test fixture.");
      }

      setInvoiceId("TEST-IRONWOOD-E2E");
      setMetadata({
        invoiceId: "TEST-IRONWOOD-E2E",
        amount: 0.00005,
        currency: "ZEC",
        network: data.network,
        pool: data.pool,
        txId: data.txId,
        outputIndex: data.outputIndex,
        rawTxHex: data.rawTxHex,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load test fixture."
      );
    } finally {
      setLoading(false);
    }
  }

  async function generateReceipt() {
    if (!metadata) {
      setError("Load a paid invoice first.");
      return;
    }

    const ovk = ovkHex.trim();

    if (!/^[0-9a-fA-F]{64}$/.test(ovk)) {
      setError("OVK must be exactly 32 bytes (64 hex characters).");
      return;
    }

    setGenerating(true);
    setError("");
    setReceipt("");

    try {
      const result = await createPrivateReceipt({
        pool: metadata.pool,
        network: metadata.network,
        txId: metadata.txId,
        outputIndex: metadata.outputIndex,
        ovkHex: ovk,
        label: metadata.invoiceId,
        rawTxHex: metadata.rawTxHex,
      });

      setReceipt(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to generate private receipt."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function verifyReceipt() {
    if (!metadata || !receipt) {
      setError("Generate a private receipt first.");
      return;
    }

    setVerifying(true);
    setError("");
    setVerification("");

    try {
      const result = await verifyPrivateReceipt(
        receipt,
        metadata.rawTxHex
      );

      setVerification(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to verify private receipt."
      );
    } finally {
      setVerifying(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <p className="text-sm text-emerald-400">Private Receipt</p>

      <h3 className="mt-2 text-xl font-semibold">
        Prove one payment. Keep the rest private.
      </h3>

      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Load a paid VeilPay invoice to prepare a selectively verifiable receipt.
        Your wallet-wide viewing capability is never included in the receipt.
      </p>

      <div className="mt-6 flex gap-3">
        <input
          value={invoiceId}
          onChange={(event) => setInvoiceId(event.target.value)}
          placeholder="VEILPAY-..."
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-emerald-400/50"
        />

        <button
          type="button"
          onClick={loadPayment}
          disabled={loading}
          className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load payment"}
        </button>

        {process.env.NODE_ENV !== "production" && (
          <button
            type="button"
            onClick={loadTestFixture}
            disabled={loading}
            className="rounded-xl border border-emerald-400/30 px-5 py-3 text-sm font-semibold text-emerald-400 disabled:opacity-50"
          >
            Load Test Fixture
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {metadata && (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500">Amount</span>
            <span>
              {metadata.amount} {metadata.currency}
            </span>
          </div>

          <div className="mt-2 flex justify-between gap-4">
            <span className="text-zinc-500">Shielded pool</span>
            <span className="capitalize">{metadata.pool}</span>
          </div>

          <div className="mt-2 flex justify-between gap-4">
            <span className="text-zinc-500">Output index</span>
            <span>{metadata.outputIndex}</span>
          </div>

          <div className="mt-5 border-t border-white/10 pt-5">
            <label className="text-sm font-medium">
              Outgoing Viewing Key (OVK)
            </label>

            <p className="mt-1 text-xs text-zinc-500">
              Used only in your browser to create this receipt. Never sent to VeilPay.
            </p>

            <input
              type="password"
              value={ovkHex}
              onChange={(event) => setOvkHex(event.target.value)}
              placeholder="64 hex characters"
              autoComplete="off"
              spellCheck={false}
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm outline-none focus:border-emerald-400/50"
            />

            <button
              type="button"
              onClick={generateReceipt}
              disabled={generating}
              className="mt-3 w-full rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black disabled:opacity-50"
            >
              {generating ? "Generating locally..." : "Generate Private Receipt"}
            </button>

            {receipt && (
              <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
                <p className="text-sm font-medium text-emerald-400">
                  Private receipt generated
                </p>
                <textarea
                  readOnly
                  value={receipt}
                  className="mt-3 h-40 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-xs text-zinc-300 outline-none"
                />

                <button
                  type="button"
                  onClick={verifyReceipt}
                  disabled={verifying}
                  className="mt-3 w-full rounded-xl border border-emerald-400/30 px-5 py-3 text-sm font-semibold text-emerald-400 disabled:opacity-50"
                >
                  {verifying ? "Verifying..." : "Verify Receipt"}
                </button>

                {verification && (
                  <div className="mt-4 rounded-xl border border-emerald-400/20 bg-black/20 p-4">
                    <p className="text-sm font-medium text-emerald-400">
                      Receipt verified
                    </p>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-zinc-300">
                      {verification}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
