const fs = require('fs');
const readline = require('readline');

async function readLastResponse() {
  const filePath = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\ec81130b-d20f-485d-8f79-a4b3559096c0\\.system_generated\\logs\\transcript.jsonl';
  if (!fs.existsSync(filePath)) {
    console.log('File not found');
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lastPlannerResponse = null;
  for await (const line of rl) {
    try {
      const data = JSON.parse(line);
      if (data.type === 'PLANNER_RESPONSE') {
        lastPlannerResponse = data;
      }
    } catch (e) {}
  }

  if (lastPlannerResponse) {
    console.log(`=== LAST RESPONSE (Step ${lastPlannerResponse.step_index}) ===`);
    console.log(lastPlannerResponse.content);
  } else {
    console.log('No planner response found');
  }
}

readLastResponse().catch(console.error);
