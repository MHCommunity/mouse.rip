/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: { unoptimized: false },
  output: 'export',
}

export default nextConfig;
