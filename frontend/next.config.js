const https = require('https-localhost')();

module.exports = {
  output: "standalone",
  
  // Redirecciones
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },

  // Reescrituras para manejar las rutas y asegurarse de que la API esté en el lugar correcto
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',  // Redirige las llamadas a /api a tu backend
        destination: 'https://localhost:3000/api/:path*',  // Suponiendo que tu backend está en HTTPS
      },
    ];
  },

  // Configuración de cabeceras y políticas de seguridad
  async headers() {
    return [
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

  devServer: {
    https: {
      key: './localhost-key.pem',
      cert: './localhost.pem',
    }
  }
};
