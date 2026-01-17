const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 8000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

http.createServer(function (request, response) {
    const parsedUrl = url.parse(request.url);
    let pathname = parsedUrl.pathname;
    console.log('request ', request.url, ' pathname ', pathname);

    let filePath = '.' + pathname;
    if (filePath == './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.end('404 Not Found', 'utf-8');
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

}).listen(port);

console.log(`Server running at http://127.0.0.1:${port}/`);
