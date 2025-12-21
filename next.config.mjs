/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5050/api/:path*",
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bytenbuild.s3.us-east-2.amazonaws.com",
        pathname: "**",
      },
    ],
  },

  // 🔹 Tell Turbopack how to handle SVGs
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js", // treat them as JS modules (React components)
      },
    },
  },

  // 🔹 Keep this for Webpack (used in some modes/tools)
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
