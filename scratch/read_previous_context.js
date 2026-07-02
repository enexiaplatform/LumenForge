const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('C:\\Users\\PC\\.gemini\\antigravity\\brain\\009e906a-3008-4b49-a8ca-dc92d868af09\\.system_generated\\logs\\transcript.jsonl');

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT') {
      console.log(`\n=== STEP ${data.step_index} USER REQUEST (at ${data.created_at}) ===`);
      console.log(data.content);
    }
  } catch (e) {
    // Ignore invalid JSON lines
  }
});
