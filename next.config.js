/** @type {import('next').NextConfig} */
const nextConfig = {
  // CORS is handled in middleware.ts and utils/cors.ts (per-route).
  // Do NOT set Allow-Origin: * with Allow-Credentials: true here — browsers reject it.
};

module.exports = nextConfig;
