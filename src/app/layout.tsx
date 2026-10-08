import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeilPay | Private Zcash Payments",
  description: "Privacy-preserving merchant payments powered by Zcash. Create shielded invoices and generate selectively verifiable payment receipts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
