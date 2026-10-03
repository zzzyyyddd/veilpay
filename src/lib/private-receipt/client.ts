import init, {
  issue_ironwood_receipt_with_raw_tx,
  issue_orchard_receipt_with_raw_tx,
} from "./gp-wasm/gp_wasm.js";

let initialized = false;

async function initializePrivateReceipt() {
  if (!initialized) {
    await init();
    initialized = true;
  }
}

export type PrivateReceiptInput = {
  pool: "orchard" | "ironwood";
  network: "mainnet" | "testnet" | "regtest";
  txId: string;
  outputIndex: number;
  ovkHex: string;
  label: string;
  rawTxHex: string;
};

export async function createPrivateReceipt(
  input: PrivateReceiptInput
): Promise<string> {
  await initializePrivateReceipt();

  const issueReceipt =
    input.pool === "ironwood"
      ? issue_ironwood_receipt_with_raw_tx
      : issue_orchard_receipt_with_raw_tx;

  return issueReceipt(
    input.network,
    input.txId,
    input.outputIndex,
    input.ovkHex,
    input.label,
    input.rawTxHex
  );
}