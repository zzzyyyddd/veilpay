import CreateInvoiceButton from "@/components/CreateInvoiceButton";
import LiveDashboard from "@/components/LiveDashboard";
import PrivateReceiptGenerator from "@/components/PrivateReceiptGenerator";
import MainnetProof from "@/components/MainnetProof";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080b0f] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Veil<span className="text-emerald-400">Pay</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Private payments powered by Zcash
            </p>
          </div>

          <CreateInvoiceButton />
        </header>

        <section className="py-10">
          <div>
            <p className="text-sm text-zinc-500">Merchant Dashboard</p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Payments without exposing customer history.
            </h2>

            <p className="mt-3 max-w-2xl text-zinc-400">
              Create private Zcash invoices and automatically detect shielded
              payments from pending transaction to confirmation.
            </p>
          </div>

          <LiveDashboard />

          <PrivateReceiptGenerator />

          <MainnetProof />
        </section>

        <footer className="mt-8 flex items-center justify-between text-xs text-zinc-600">
          <span>VeilPay MVP</span>
          <span>Shielded payment infrastructure</span>
        </footer>
      </div>
    </main>
  );
}
