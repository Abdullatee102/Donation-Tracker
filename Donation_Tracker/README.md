# BotDonationTracker

A decentralized Web3 application for tracking ETH and BOT donations on the Bohr Testnet. Users can contribute ETH or BOT to a shared community fund. The smart contract automatically keeps track of donations, donors, and the total amount raised. Authorized users (the contract owner) can withdraw funds for approved purposes.

## Features

- **Decentralized Donations**: Track and manage donations completely on-chain.
- **Support for BOT & ETH**: Accept donations natively.
- **Detailed History**: Every donation is recorded with the donor's wallet address, the amount donated, and the total donations received.
- **Withdrawal Controls**: Only authorized administrators can withdraw the accumulated funds.
- **Live Feed & Stats**: View the real-time donation feed and statistics on the frontend.

## Network Configurations

This project is configured to run on the **Bohr Testnet**:

- **Chain ID**: 968
- **RPC URL**: `https://rpc.bohr.life`
- **Native Token**: BOT
- **Explorer**: `https://scan.bohr.life/`
- **Faucet**: `https://faucet.botchain.ai/en/basic`

## Getting Started

### Prerequisites

- Node.js (v18+)
- Metamask or compatible Web3 Wallet
- Some Testnet BOT tokens (from the Faucet)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env.local` file with the following variables:
   ```bash
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
   PRIVATE_KEY=your_wallet_private_key
   NEXT_PUBLIC_DEFAULT_CONTRACT_ADDRESS=your_deployed_contract_address
   ```

### Deployment

To deploy the smart contract to the Bohr Testnet:

```bash
npm run deploy:contract
```

### Running the App Locally

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to interact with the local development environment.

### Live Production App

The application has been deployed live and is available for everyone to test globally!
**Access it here:** [https://donation-tracker-henna.vercel.app](https://donation-tracker-henna.vercel.app)

## Technologies Used

- Next.js (App Router)
- React
- Tailwind CSS
- Solidity (Smart Contracts)
- Wagmi & Reown AppKit
- ethers.js & viem

## License

MIT
