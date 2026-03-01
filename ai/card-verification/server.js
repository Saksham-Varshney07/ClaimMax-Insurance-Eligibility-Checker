#!/usr/bin/env node

/**
 * Simple HTTP Server for ClaimMax
 * Serves the app and allows fetch() to work (fixes CORS issues)
 * Run: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const HOST = 'localhost';

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    // Parse URL
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Default to index.html for root
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Get file path
    const filePath = path.join(__dirname, pathname);

    // Security: prevent directory traversal
    const realPath = path.resolve(filePath);
    if (!realPath.startsWith(path.resolve(__dirname))) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    // Read and serve file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                console.log(`❌ 404: ${pathname}`);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Server Error');
                console.log(`❌ 500: ${pathname} - ${err.message}`);
            }
            return;
        }

        // Get MIME type
        const ext = path.extname(filePath).toLowerCase();
        const mimeType = mimeTypes[ext] || 'application/octet-stream';

        // Add CORS headers to allow fetch
        res.writeHead(200, {
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-cache'
        });

        res.end(data);
        console.log(`✅ 200: ${pathname} (${mimeType})`);
    });
});

server.listen(PORT, HOST, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 ClaimMax Server Started');
    console.log('='.repeat(60));
    console.log(`\n📍 Open your browser and go to:\n`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   or`);
    console.log(`   http://127.0.0.1:${PORT}\n`);
    console.log('⚠️  Keep this terminal open while testing\n');
    console.log('Press Ctrl+C to stop the server\n');
    console.log('='.repeat(60) + '\n');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Server stopped\n');
    process.exit(0);
});
