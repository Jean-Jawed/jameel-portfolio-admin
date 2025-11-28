#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIST_DIR = path.join(__dirname, '../dist');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Gérer les routes de langue sans .html
  if (req.url.match(/^\/(fr|en|ar)\/?$/)) {
    const lang = req.url.replace(/\//g, '');
    filePath = path.join(DIST_DIR, lang, 'index.html');
  }
  // Ajouter .html si pas d'extension
  else if (!path.extname(filePath)) {
    filePath += '.html';
  }
  
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1>');
    return;
  }
  
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('500 Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/`);
  console.log(`📁 Serving files from: ${DIST_DIR}`);
  console.log('\nPress Ctrl+C to stop');
});
