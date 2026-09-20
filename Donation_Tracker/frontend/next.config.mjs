import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_REOWN_PROJECT_ID: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
    NEXT_PUBLIC_DEFAULT_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_DEFAULT_CONTRACT_ADDRESS,
  },
  experimental: {
    serverComponentsExternalPackages: ['pino-pretty', 'lokijs', 'encoding'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        encoding: false,
        'pino-pretty': false,
      };
    }
    return config;
  },
};

export default nextConfig;



