/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5050/api/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bytenbuild.s3.us-east-2.amazonaws.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;