const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const next = require('next');
const cors = require('cors');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'localhost.pem')),
};

app.prepare().then(() => {
  const server = express();

  // Habilita CORS
  server.use(cors());

  // Maneja todas las rutas con Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Crea el servidor HTTPS con Express
  https.createServer(httpsOptions, server).listen(3001, (err) => {
    if (err) throw err;
    console.log('> Server started on https://localhost:3001');
  });
}).catch((err) => {
  console.error('Error initializing server:', err);
});
