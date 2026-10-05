/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/app/configuracoes/integracoes/acesso/:channel',
        destination: '/app/settings/integrations/connect/:channel',
        permanent: false,
      },
      { source: '/login', destination: '/auth/login', permanent: false },
      { source: '/confirmar-email', destination: '/confirm-email', permanent: false },
      {
        source: '/authentication/reset-password',
        destination: '/auth/reset-password',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/external/cnpj/:cnpj',
        destination: 'https://www.receitaws.com.br/v1/cnpj/:cnpj',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
