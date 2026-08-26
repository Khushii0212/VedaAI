/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack config (Next.js 16 default)
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },

  // Increase body size limit for API routes that handle base64-encoded PDF pages
  serverExternalPackages: [],
};

export default nextConfig;
