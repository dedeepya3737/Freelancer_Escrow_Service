const http = require('http');
const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, 'src', 'registry', 'data.ts');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const newItem = JSON.parse(body);
        
        // Load the current data.ts
        let content = fs.readFileSync(REGISTRY_PATH, 'utf8');
        
        // We will insert the new item at the top of the registryData array
        // Pattern: export const registryData: Escrow[] = [
        const marker = 'export const registryData: Escrow[] = [';
        const index = content.indexOf(marker) + marker.length;
        
        const itemString = `\n  ${JSON.stringify(newItem, null, 2)},`;
        
        const newContent = content.slice(0, index) + itemString + content.slice(index);
        
        fs.writeFileSync(REGISTRY_PATH, newContent);
        
        console.log(">>> REGISTRY UPDATED: " + newItem.title);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error("Registry Error:", err);
        res.writeHead(500);
        res.end("Internal Error");
      }
    });
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Registry Backend V2 Active on Port ${PORT}`);
});
