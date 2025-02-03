const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Importa el paquete cors


const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'localhost.pem')),
};

app.prepare().then(() => {
  const server = createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Usa cors como middleware
  server.on('request', cors());

  server.listen(3001, (err) => {
    if (err) throw err;
    console.log('> Server started on https://localhost:3001');
  });
});