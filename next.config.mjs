/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow CoinGecko's coin logo images to be used with next/image.
    remotePatterns: [
      { protocol: "https", hostname: "*.coingecko.com" },
      { protocol: "https", hostname: "coingecko.com" },
    ],
  },
};

export default nextConfig;
