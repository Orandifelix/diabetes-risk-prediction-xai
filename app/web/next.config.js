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
    // Force alias for @ and @/lib
    const projectRoot = path.resolve(__dirname);
    config.resolve.alias['@'] = projectRoot;
    config.resolve.alias['@/lib'] = path.join(projectRoot, 'lib');
    
    // Also add the project root as a module directory (fallback)
    config.resolve.modules.push(projectRoot);
    
    console.log('✅ Webpack alias @ set to', projectRoot);
    console.log('✅ Webpack alias @/lib set to', path.join(projectRoot, 'lib'));
    return config;
  },
};

module.exports = nextConfig;