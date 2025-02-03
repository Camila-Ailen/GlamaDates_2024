module.exports = {
  output: "standalone",

  // Redirecciones
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },

  // Reescrituras para manejar las rutas y asegurarse de que la API esté en el lugar correcto
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://localhost:3000/api/:path*', // Backend API
      },
    ];
  },

  // Configuración de cabeceras y políticas de seguridad
  async headers() {
    return [
      // Puedes descomentar y ajustar según sea necesario
      // {
      //   source: '/:path*',
      //   headers: [
      //     { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      //     { key: 'X-Content-Type-Options', value: 'nosniff' },
      //     { key: 'X-Frame-Options', value: 'DENY' },
      //     { key: 'X-XSS-Protection', value: '1; mode=block' },
      //   ],
      // },
    ];
  },
};
