const payosModule = require('@payos/node');
console.log('Type of payosModule:', typeof payosModule);
console.log('Exports keys:', Object.keys(payosModule));
if (payosModule.default) {
  console.log('Type of payosModule.default:', typeof payosModule.default);
}
