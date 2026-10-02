import init, {
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

  return issue_orchard_receipt_with_raw_tx(
    input.network,
    input.txId,
    input.outputIndex,
    input.ovkHex,
    input.label,
    input.rawTxHex
  );
}