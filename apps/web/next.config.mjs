/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@veda/shared'],
  async rewrites() {
    const upstream = process.env.API_URL ?? 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${upstream}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
