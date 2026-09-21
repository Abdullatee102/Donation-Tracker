# ⚡ BotDonationTracker

[![Live App](https://img.shields.io/badge/Live%20App-Vercel-00f2fe?style=for-the-badge&logo=vercel)](https://donation-tracker-henna.vercel.app)
[![Network](https://img.shields.io/badge/Network-Bohr%20Testnet%20(968)-7f00ff?style=for-the-badge)](https://scan.bohr.life/)
[![Stack](https://img.shields.io/badge/Stack-Next.js%2014%20•%20Wagmi%20•%20Reown%20AppKit-10b981?style=for-the-badge)](https://reown.com)

**BotDonationTracker** is a decentralized Web3 application designed for real-time tracking and direct sending of native **BOT** (and ETH) donations on the **Bohr Testnet**. 

Featuring a sleek dark-mode interface built with Next.js 14 and Tailwind CSS, the platform connects directly to Bohr Testnet RPC nodes to monitor incoming donations, compute volume statistics, and execute on-chain contributions seamlessly through **Reown AppKit** and **Wagmi v2**.

🌐 **Live Production App:** [https://donation-tracker-henna.vercel.app](https://donation-tracker-henna.vercel.app)

---

## 🚀 Key Features & Platform Workflow

### 1. 🔍 Real-Time On-Chain Address Tracking
- **Universal Target Search**: Enter any Bohr or EVM smart contract address or recipient wallet address to track incoming donations.
- **Direct RPC Block Scanning**: Queries the Bohr Testnet RPC (`https://rpc.bohr.life`) in real time, avoiding stale third-party indexing delays.
- **Analytics Overview**: Automatically computes:
  - **Contract / Wallet Balance** (formatted in native BOT)
  - **Total Donations Recorded**
  - **Highest Individual Donation**
  - **Live Block Height & RPC Sync Status**
  - **Configurable Auto-Sync Polling** (5s, 10s, 30s, or Manual)

### 2. 🦊 Modern Reown AppKit & Wagmi Wallet Integration
- **Multi-Wallet Support**: Full integration with `@reown/appkit` and `wagmi@2.x`:
  - **MetaMask** (with automatic installed extension detection via EIP-6963)
  - **Trust Wallet**
  - **Coinbase Wallet**
  - **Binance Wallet**
  - **SafePal**
  - **WalletConnect QR Code** for mobile wallet apps (Rainbow, Trust, MetaMask Mobile, etc.)
- **Reactive State**: Synchronized balance, address display, and network switching across all components.

### 3. 💸 Direct On-Chain Donations
- **Preset & Custom Amounts**: Quick-select presets (`0.5`, `1.0`, `5.0`, `10.0`, `50.0` BOT) or input custom donation quantities.
- **On-Chain Donor Messages (Hex Memo)**: Attach optional messages/memos that are permanently recorded on the blockchain via function calls (`donate(string)`) or transaction hex data.
- **Network Safety Checks**: Automatic verification and one-click prompts to switch to Bohr Testnet if connected to an incompatible network.
- **Confetti Celebration**: Immediate visual confirmation and feed refresh upon transaction confirmation.

### 4. 📊 Live Feed & Data Export
- **Live Event Stream**: Chronological feed displaying donor address, amount, block timestamp, transaction hash, and donor memos.
- **Search & Filters**: Filter donations by donor address, memo content, or minimum amount.
- **Export Capabilities**: Download the complete verified donation event history as **CSV** or **JSON** for reporting and auditing.

### 5. 🔬 Bytecode Explorer & Contract Inspector
- View decompiled/raw bytecode of target contracts to verify deployment integrity directly on the Bohr network.
- Quick link to view addresses and transactions directly on the [BohrScan Block Explorer](https://scan.bohr.life/).

### 6. 📱 Full Responsive Design
- Carefully crafted with mobile-first Tailwind CSS to ensure a clean, fluid experience on mobile phones, tablets, and desktop displays.

---

## 🌐 Bohr Testnet Specifications

| Parameter | Value |
|---|---|
| **Network Name** | Bohr Testnet |
| **Chain ID** | `968` |
| **Hex Chain ID** | `0x3c8` |
| **Currency Symbol** | `BOT` |
| **Decimals** | `18` |
| **RPC URL** | [https://rpc.bohr.life](https://rpc.bohr.life) |
| **Block Explorer** | [https://scan.bohr.life/](https://scan.bohr.life/) |
| **Testnet Faucet** | [https://faucet.botchain.ai/en/basic](https://faucet.botchain.ai/en/basic) |

---

## 🛠️ Project Structure

```text
Donation_Tracker/
├── contract/                       # Smart contract source & deployment scripts
│   ├── contracts/
│   │   └── DonationTracker.sol     # Core Solidity donation contract
│   └── scripts/
│       └── deploy.js               # Contract deployment script
├── frontend/                       # Next.js 14 frontend application
│   ├── public/                     # Static assets & icons
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css         # Global styles & responsive backdrop glow
│   │   │   ├── layout.tsx          # Root layout with Web3Provider
│   │   │   └── page.tsx            # Main application dashboard
│   │   ├── components/
│   │   │   ├── ContractExplorer.tsx # Bytecode explorer component
│   │   │   ├── ContractSelector.tsx # Target address search bar & watchlist
│   │   │   ├── DonateModal.tsx     # Direct donation modal with memo input
│   │   │   ├── Navbar.tsx          # Top nav with Reown AppKit Connect button
│   │   │   ├── ReownAppKitProvider.tsx # AppKit + Wagmi provider configuration
│   │   │   ├── StatsOverview.tsx   # Live metric cards & sync controls
│   │   │   └── TransactionFeed.tsx # Real-time donation stream & CSV/JSON export
│   │   └── lib/
│   │       ├── networks.ts         # Bohr Testnet network definitions
│   │       ├── types.ts            # TypeScript interfaces
│   │       └── web3.ts             # Direct RPC & wallet transaction helpers
│   ├── next.config.mjs             # Next.js build & webpack configuration
│   ├── package.json                # Project dependencies
│   └── tailwind.config.js          # Tailwind design system configuration
├── .env.local                      # Environment variables
└── README.md                       # Documentation
```

---

## 💻 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
- [npm](https://www.npmjs.com/)
- A Web3 wallet (MetaMask, Trust Wallet, etc.) configured with testnet BOT from the [Bohr Faucet](https://faucet.botchain.ai/en/basic).

### 1. Clone the Repository
```bash
git clone https://github.com/Abdullatee102/Donation-Tracker.git
cd Donation-Tracker/Donation_Tracker
```

### 2. Environment Configuration
Create a `.env.local` file inside the `frontend/` directory (or use the root `.env.local`):
```env
# Reown (WalletConnect) Project ID from https://cloud.reown.com
NEXT_PUBLIC_REOWN_PROJECT_ID=202f49df3a791669309a0178347d64ee

# Deployed Contract Address on Bohr Testnet
NEXT_PUBLIC_DEFAULT_CONTRACT_ADDRESS=0xeF004ab3406a0113FcF3a5Ae838d118ad61A255a

# Private Key for contract deployments (optional)
PRIVATE_KEY=your_private_key_here
```

### 3. Install Dependencies
```bash
cd frontend
npm install
```

### 4. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 5. Build for Production
```bash
npm run build
```

---

## 📦 Smart Contract Interaction

The companion smart contract is deployed on **Bohr Testnet** at:
`0xeF004ab3406a0113FcF3a5Ae838d118ad61A255a`

### Key Contract Functions:
- `donate(string _message) external payable`: Accepts native BOT/ETH along with a message, emitting a `DonationReceived(address indexed donor, uint256 amount, uint256 timestamp, string message)` event.
- `getDonationHistory() external view returns (Donation[] memory)`: Returns all recorded donations.
- `withdraw(uint256 _amount) external onlyOwner`: Allows the verified contract owner to withdraw collected funds.

---

## 🛡️ License

This project is open-source and available under the [MIT License](LICENSE).
