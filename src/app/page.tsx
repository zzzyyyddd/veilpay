import CreateInvoiceButton from "@/components/CreateInvoiceButton";

export default async function Home() {
  const response = await fetch("http://localhost:3000/api/invoices/detect", {
    cache: "no-store",
  });

  const data = await response.json();
  const invoices = data.invoices ?? [];

  const totalReceived = invoices
    .filter((invoice: any) => invoice.status === "paid")
    .reduce((total: number, invoice: any) => total + invoice.amount, 0);

  const paidInvoices = invoices.filter(
    (invoice: any) => invoice.status === "paid"
  ).length;

  const pendingInvoices = invoices.filter(
    (invoice: any) => invoice.status === "pending"
  ).length;

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

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StatCard
              label="Total received"
              value={`${totalReceived.toFixed(2)} ZEC`}
            />
            <StatCard label="Paid invoices" value={String(paidInvoices)} />
            <StatCard label="Pending invoices" value={String(pendingInvoices)} />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <h3 className="font-semibold">Recent invoices</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Shielded Zcash payment activity
              </p>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-400">
              Zcash Regtest
            </span>
          </div>

          <div className="divide-y divide-white/10">
            {invoices.map((invoice: any) => (
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

        <footer className="mt-8 flex items-center justify-between text-xs text-zinc-600">
          <span>VeilPay MVP</span>
          <span>Shielded payment infrastructure</span>
        </footer>
      </div>
    </main>
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
