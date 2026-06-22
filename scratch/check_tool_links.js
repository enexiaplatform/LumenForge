const fs = require('fs');
const path = require('path');

// Read tools-db.js. It defines window.TOOLS_DB = [...]
// We will extract it by reading the file and parsing/evaluating it.
const dbPath = path.join(__dirname, '..', 'js', 'tools-db.js');
let dbContent = fs.readFileSync(dbPath, 'utf8');

// Simple parse: evaluate it by creating a mock window object
const sandbox = { window: {} };
const fn = new Function('window', dbContent);
fn(sandbox.window);

const tools = sandbox.window.TOOLS_DB;
console.log(`Loaded ${tools.length} tools from tools-db.js\n`);

let missingCount = 0;
tools.forEach(t => {
    // link is like "tools/ai-storyboard.html"
    const filePath = path.join(__dirname, '..', t.link);
    const exists = fs.existsSync(filePath);
    if (!exists) {
        console.log(`[-] MISSING: Tool "${t.title}" (${t.id}) links to "${t.link}" which DOES NOT exist!`);
        missingCount++;
    } else {
        console.log(`[+] OK: "${t.title}" -> "${t.link}"`);
    }
});

console.log(`\nVerification finished. Missing files: ${missingCount}`);
process.exit(missingCount > 0 ? 1 : 0);
