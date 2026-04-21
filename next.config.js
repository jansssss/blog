/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/blog/자영업자-신용대출-조건-총정리-가능-기준한도승인-포인트-2026년',
        destination: '/guide/loan-types-complete',
        permanent: true,
      },
      {
        source: '/blog/신용점수-낮아도-신용대출-가능한-조건-정리-2026년-기준',
        destination: '/guide/credit-score',
        permanent: true,
      },
      {
        source: '/blog/unemployment-benefits-2025-guide',
        destination: '/guide/loan-checklist',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
