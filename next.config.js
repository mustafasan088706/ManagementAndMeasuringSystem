/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return []
  },
  // Sayfanın doğru yüklenmesi için ek yapılandırmalar
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true
}

module.exports = nextConfig 