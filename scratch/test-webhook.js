process.env.PAYOS_CLIENT_ID = 'mock-client-id';
process.env.PAYOS_API_KEY = 'mock-api-key';
process.env.PAYOS_CHECKSUM_KEY = 'mock-checksum-key';
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

const handler = require('../api/payos-webhook.js');

// Mock request and response
const req = {
  method: 'POST',
  body: {
    desc: 'confirm',
    ok: true
  }
};

const res = {
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(data) {
    this.data = data;
    return this;
  }
};

async function test() {
  try {
    await handler(req, res);
    console.log('Test result:');
    console.log('Status Code:', res.statusCode);
    console.log('Body:', res.data);
    if (res.statusCode === 200 && res.data.success === true) {
      console.log('SUCCESS: Webhook confirmation handled correctly.');
    } else {
      console.error('FAILED: Incorrect response.');
    }
  } catch (error) {
    console.error('ERROR: Threw exception:', error);
  }
}

test();
