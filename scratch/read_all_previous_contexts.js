const fs = require('fs');
const readline = require('readline');
const path = require('path');

const conversationIds = [
  '009e906a-3008-4b49-a8ca-dc92d868af09',
  'bc0c415c-3af1-4625-a1bc-d103da04c12b',
  'ec81130b-d20f-485d-8f79-a4b3559096c0'
];

async function readTranscript(id) {
  const filePath = `C:\\Users\\PC\\.gemini\\antigravity\\brain\\${id}\\.system_generated\\logs\\transcript.jsonl`;
  if (!fs.existsSync(filePath)) {
    console.log(`File not found for ${id}: ${filePath}`);
    return;
  }
  
  console.log(`\n======================================================`);
  console.log(`CONVERSATION ID: ${id}`);
  console.log(`======================================================`);

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let stepCount = 0;
  for await (const line of rl) {
    try {
      const data = JSON.parse(line);
      stepCount = Math.max(stepCount, data.step_index);
      if (data.type === 'USER_INPUT') {
        console.log(`\n[Step ${data.step_index}] USER: ${data.content.trim()}`);
      } else if (data.type === 'PLANNER_RESPONSE') {
        if (data.content && data.content.trim()) {
          const lines = data.content.split('\n');
          const preview = lines.slice(0, 5).join('\n') + (lines.length > 5 ? '\n...' : '');
          console.log(`[Step ${data.step_index}] ASSISTANT (preview):\n${preview}`);
        }
      }
    } catch (e) {
      // Ignore
    }
  }
  console.log(`Total steps: ${stepCount}`);
}

async function run() {
  for (const id of conversationIds) {
    await readTranscript(id);
  }
}

run().catch(console.error);
