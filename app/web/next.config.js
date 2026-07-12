const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  webpack: (config, { isServer }) => {
    // Alias @ to the app/web directory – this covers all @/ imports
    config.resolve.alias['@'] = path.resolve(__dirname);
    console.log('✅ Webpack alias @ set to', path.resolve(__dirname));
    return config;
  },
};

module.exports = nextConfig;