const fs = require('fs');

const srcPath = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\ec81130b-d20f-485d-8f79-a4b3559096c0\\commercial_onboarding_guide.md';
const destPath = 'e:\\Antigravity project\\LumenForge\\commercial_onboarding_guide.md';

if (fs.existsSync(srcPath)) {
  fs.copyFileSync(srcPath, destPath);
  console.log(`Successfully copied commercial_onboarding_guide.md to ${destPath}`);
} else {
  console.log(`Source file does not exist: ${srcPath}`);
}
