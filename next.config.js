/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'minio.nutech-integrasi.com',
        port: '',
        pathname: '/take-home-test/**',
      },
    ],
  },
};

module.exports = nextConfig;