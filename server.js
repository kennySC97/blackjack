const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const PUBLIC_DIR = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

  // Resolve the file path
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);

  // Get the file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Read the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
        console.log(`  404: ${filePath}`);
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
        console.error(`  500: ${error.code} - ${error.message}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
      console.log(`  200: ${filePath}`);
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from: ${PUBLIC_DIR}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use!`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});
