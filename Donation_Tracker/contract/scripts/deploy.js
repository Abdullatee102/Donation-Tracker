/** Deploy BotDonationTracker to Bohr Testnet (Chain ID 968). */
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

const RPC_URL = 'https://rpc.bohr.life';
const EXPECTED_CHAIN_ID = 968n;
const ENV_FILE_PATH = path.join(__dirname, '..', '..', '.env.local');

// Helper to load .env.local into process.env
function loadEnv() {
  if (fs.existsSync(ENV_FILE_PATH)) {
    const content = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

// Helper to write key-value to .env.local
function updateEnvKey(key, value) {
  let lines = [];
  if (fs.existsSync(ENV_FILE_PATH)) {
    lines = fs.readFileSync(ENV_FILE_PATH, 'utf8').split(/\r?\n/);
  }
  let updated = false;
  const newLines = lines.map((line) => {
    if (line.trim().startsWith(`${key}=`)) {
      updated = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!updated) {
    newLines.push(`${key}=${value}`);
  }
  fs.writeFileSync(ENV_FILE_PATH, newLines.filter(Boolean).join('\n') + '\n', 'utf8');
}

function compileContract() {
  const sourcePath = path.join(__dirname, '..', 'contracts', 'BotDonationTracker.sol');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const input = {
    language: 'Solidity',
    sources: { 'BotDonationTracker.sol': { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = output.errors || [];
  const fatalErrors = errors.filter((error) => error.severity === 'error');
  if (fatalErrors.length > 0) {
    throw new Error(fatalErrors.map((error) => error.formattedMessage).join('\n'));
  }

  const artifact = output.contracts?.['BotDonationTracker.sol']?.BotDonationTracker;
  if (!artifact?.evm?.bytecode?.object) {
    throw new Error('Solidity compilation produced no deployable bytecode.');
  }

  return artifact;
}

async function main() {
  loadEnv();
  let privateKey = process.env.PRIVATE_KEY;

  console.log('Connecting to Bohr Testnet RPC:', RPC_URL);
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const network = await provider.getNetwork();
  if (network.chainId !== EXPECTED_CHAIN_ID) {
    throw new Error(`Unexpected chain ID ${network.chainId}; expected ${EXPECTED_CHAIN_ID}.`);
  }

  let wallet;
  if (!privateKey) {
    console.log('No PRIVATE_KEY found in process.env or .env.local.');
    wallet = ethers.Wallet.createRandom(provider);
    privateKey = wallet.privateKey;
    updateEnvKey('PRIVATE_KEY', privateKey);
    console.log('Generated new deployer wallet address:', wallet.address);
    console.log('Saved generated PRIVATE_KEY to .env.local');
  } else {
    wallet = new ethers.Wallet(privateKey, provider);
    console.log('Using deployer wallet address:', wallet.address);
  }

  const balance = await provider.getBalance(wallet.address);
  console.log('Wallet balance:', ethers.formatEther(balance), 'BOT');

  if (balance === 0n) {
    console.log('\n-----------------------------------------------------------');
    console.log('Deployer wallet balance is 0 BOT.');
    console.log('To deploy the smart contract on Bohr Testnet:');
    console.log('1. Visit the faucet: https://faucet.botchain.ai/en/basic');
    console.log('2. Claim free testnet BOT tokens to address:', wallet.address);
    console.log('3. Run deployment again: npm run deploy:contract');
    console.log('-----------------------------------------------------------\n');
    process.exit(1);
  }

  const artifact = compileContract();
  const factory = new ethers.ContractFactory(artifact.abi, artifact.evm.bytecode.object, wallet);
  console.log('Deploying BotDonationTracker to Bohr Testnet...');
  const contract = await factory.deploy();
  console.log('Deployment transaction hash:', contract.deploymentTransaction().hash);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log('Contract successfully deployed at address:', contractAddress);

  updateEnvKey('NEXT_PUBLIC_DEFAULT_CONTRACT_ADDRESS', contractAddress);
  console.log('Updated NEXT_PUBLIC_DEFAULT_CONTRACT_ADDRESS in .env.local');
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});

