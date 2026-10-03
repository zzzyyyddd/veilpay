"use client";

import { useState } from "react";
import { verifyPrivateReceipt } from "@/lib/private-receipt/client";

type VerificationResult = {
  status: string;
  verifier: string;
  network: string;
  pool: string;
  tx_id: string;
  parsed_tx_id: string;
  output_index: number;
  label: string;
  signature: string;
  amount_zatoshis: number;
  amount_zec: string;
  memo: string;
  recipient: string;
};

const TX_ID =
  "0ebda643fcf5c86d071a9cdc1cb2a64113528c67ab02ef0e016d30e7735b22ad";

export default function MainnetProof() {
  const [verification, setVerification] =
    useState<VerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  async function verifyMainnetProof() {
    setVerifying(true);
    setVerification(null);
    setError("");

    try {
      const [receiptResponse, rawTxResponse] = await Promise.all([
        fetch("/proofs/veilpay-mainnet-receipt.json"),
        fetch("/proofs/veilpay-mainnet-tx.hex"),
      ]);

      if (!receiptResponse.ok || !rawTxResponse.ok) {
        throw new Error("Unable to load the mainnet proof fixture.");
      }

      const receipt = await receiptResponse.text();
      const rawTxHex = (await rawTxResponse.text()).trim();

      const result = await verifyPrivateReceipt(receipt, rawTxHex);
      setVerification(JSON.parse(result) as VerificationResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to verify mainnet proof."
      );
    } finally {
      setVerifying(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.03] p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-emerald-400">Mainnet Proof</p>
            <span className="rounded-full border border-emerald-400/30 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
              LIVE ZCASH
            </span>
          </div>

          <h3 className="mt-2 text-xl font-semibold">
            Verify a real shielded payment.
          </h3>

          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            This receipt was created from a real Zcash mainnet Ironwood
            transaction. Verification happens locally in your browser and
            reveals only the selected payment output.
          </p>
        </div>

        <span className="w-fit rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-zinc-400">
          Ironwood · Mainnet
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-zinc-500">Payment</p>
          <p className="mt-1 font-medium">0.00001000 ZEC</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-zinc-500">Invoice</p>
          <p className="mt-1 font-medium">VEILPAY-MAINNET-001</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-zinc-500">Selected output</p>
          <p className="mt-1 font-medium">#1</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs text-zinc-500">Transaction ID</p>
        <p className="mt-2 break-all font-mono text-xs text-zinc-300">
          {TX_ID}
        </p>
      </div>

      <button
        type="button"
        onClick={verifyMainnetProof}
        disabled={verifying}
        className="mt-5 w-full rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {verifying ? "Verifying cryptographically..." : "Verify Mainnet Proof"}
      </button>

      <p className="mt-3 text-center text-xs text-zinc-500">
        No OVK, seed phrase, or wallet-wide viewing key is required to verify.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.04] p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {verification && (
        <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.05] p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-base font-semibold text-emerald-400">
                ✓ Mainnet Receipt Verified
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                The selected Ironwood output was recovered from the disclosed
                receipt and raw transaction.
              </p>
            </div>

            <span className="w-fit rounded-full border border-emerald-400/30 px-3 py-1 text-xs text-emerald-400">
              {verification.network} · {verification.pool}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-zinc-500">Recovered amount</p>
              <p className="mt-1 font-medium">
                {verification.amount_zec} ZEC
              </p>
            </div>

            <div>
              <p className="text-xs text-zinc-500">Recovered memo</p>
              <p className="mt-1 font-medium">{verification.memo || "None"}</p>
            </div>

            <div>
              <p className="text-xs text-zinc-500">Output</p>
              <p className="mt-1 font-medium">
                #{verification.output_index}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs text-zinc-500">Recovered recipient</p>
            <p className="mt-1 break-all font-mono text-xs text-zinc-300">
              {verification.recipient}
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-3">
            <p className="text-xs leading-relaxed text-zinc-400">
              Verification did not require the customer&apos;s OVK. The receipt
              selectively discloses this payment output without granting
              wallet-wide viewing capability.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}