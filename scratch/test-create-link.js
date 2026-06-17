process.env.PAYOS_CLIENT_ID = 'mock-client-id';
process.env.PAYOS_API_KEY = 'mock-api-key';
process.env.PAYOS_CHECKSUM_KEY = 'mock-checksum-key';
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';
process.env.LIVE_GATEWAY_PROVIDER = 'payos';


const handler = require('../api/create-payment-link.js');

// Mock request and response
const req = {
  method: 'POST',
  body: {
    userId: '12345',
    productId: 'test-product',
    price: 100000
  }
};

const res = {
  headers: {},
  setHeader(name, value) {
    this.headers[name] = value;
  },
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
  } catch (error) {
    console.error('ERROR: Threw exception:', error);
  }
}

test();
