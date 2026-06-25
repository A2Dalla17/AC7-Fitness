/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // OneDrive + WSL corrupts webpack persistent cache — disable in dev.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
      // OneDrive + WSL: polling avoids broken file watches / client manifest drift
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**'],
      };
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/home',
        permanent: true,
      },
      {
        source: '/missions/rank/:rank',
        destination: '/missions/:rank',
        permanent: false,
      },
      {
        source: '/missions/rank/:rank/train/:stage',
        destination: '/missions/:rank/train/:stage',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
