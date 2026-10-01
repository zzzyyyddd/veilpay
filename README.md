# VeilPay

**Privacy-preserving merchant payments powered by Zcash.**

VeilPay is a merchant checkout prototype that lets businesses create Zcash payment invoices and automatically detect shielded payments without requiring customers to expose their public transaction history.

Built for the **Crypto World's Fair 2026**.

## Why VeilPay?

Most crypto checkout systems make payment activity publicly visible on-chain. That can expose customer wallet history, balances, and transaction relationships.

VeilPay explores a different checkout model:

- Merchant creates an invoice
- Customer receives a Zcash payment request and QR code
- Customer pays using shielded ZEC
- VeilPay detects the incoming payment automatically
- The invoice moves from Pending to Paid after confirmation
- Merchant receives a payment receipt with transaction details

The goal is simple: make privacy-preserving crypto payments feel like normal merchant checkout infrastructure.

## Working MVP

The current prototype includes:

- Merchant dashboard
- ZEC invoice creation
- Zcash payment URI generation
- QR code checkout
- Invoice ID embedded in the payment memo
- Automatic shielded payment detection
- Exact invoice matching by merchant account, memo, and amount
- Pending payment detection before confirmation
- Automatic Pending → Paid status updates
- Live dashboard polling
- Zcash connection status and automatic recovery
- Payment receipts with TXID and mined block
- Persistent local invoice storage for development

The end-to-end payment flow has been tested on **Zcash regtest** using Z3/Zallet.

## Payment Flow

```text
Merchant
   |
   v
Create Invoice
   |
   v
VeilPay generates payment request + QR
   |
   v
Customer sends shielded ZEC
   |
   v
Zallet / Zcash
   |
   v
VeilPay detects memo + amount
   |
   +---- unconfirmed ----> Pending
   |
   +---- mined ----------> Paid
                              |
                              v
                           Receipt
```

## Architecture

```text
Browser
   |
   v
Next.js Merchant Dashboard
   |
   v
VeilPay API
   |
   +--> Invoice Store
   |
   +--> Zcash RPC Router
            |
            v
          Zallet
            |
            v
          Zebra
            |
            v
       Zcash Regtest
```

## Tech Stack

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- QRCode
- Z3
- Zallet
- Zebra
- Docker

## Local Development

### Requirements

- Node.js 22+
- npm
- Docker Desktop
- WSL2/Linux environment recommended
- A running Z3/Zallet Zcash environment

### Install
```bash
git clone <repository-url>
cd veilpay
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Configure:

```env
ZCASH_RPC_URL=http://127.0.0.1:8181
ZCASH_MERCHANT_ACCOUNT=your-merchant-account-uuid
ZCASH_MERCHANT_ADDRESS=your-zcash-unified-address
```

Then start VeilPay:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Zcash Integration

VeilPay currently connects to a local Zcash regtest environment through the Z3 RPC router.

The detector reads wallet transactions and matches incoming payments using:

1. Merchant account
2. Positive incoming balance
3. Invoice memo
4. Exact ZEC amount

An unmined matching transaction keeps the invoice in **Pending** state. Once the transaction has a mined height, VeilPay marks the invoice **Paid**.

## Current Status

VeilPay is an MVP and hackathon prototype.

The core shielded checkout flow is working end-to-end on Zcash regtest. Production deployment, persistent hosted storage, remote Zcash infrastructure, authentication, and mainnet merchant onboarding are future work.

## Roadmap

- Hosted persistent invoice database
- Remote Zcash backend
- Merchant authentication
- Mainnet-ready merchant onboarding
- Webhook/API integrations for external merchants
- Additional checkout and settlement options
- Agent-friendly payment APIs

## Privacy

VeilPay is designed around minimizing unnecessary exposure of customer transaction history. It does not claim to make payments universally untraceable or anonymous.

## License

License information will be added before public release.
