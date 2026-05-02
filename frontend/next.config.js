/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Forward all /api/* calls to the Flask bridge running on port 5000
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:5000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
