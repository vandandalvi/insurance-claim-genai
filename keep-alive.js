const https = require('https');
const http = require('http');

// Configuration
const SERVICES = [
  {
    name: 'Main Backend',
    url: 'https://claimsense-backend.onrender.com',
    endpoint: '/'
  },
  {
    name: 'Chatbot Backend', 
    url: 'https://claimsense-chatbot.onrender.com',
    endpoint: '/'
  }
];

// Function to ping a service
function pingService(service) {
  return new Promise((resolve, reject) => {
    const url = new URL(service.url + service.endpoint);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      timeout: 10000 // 10 second timeout
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const timestamp = new Date().toISOString();
        console.log(`✅ [${timestamp}] ${service.name} - Status: ${res.statusCode}`);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ service: service.name, status: 'success', code: res.statusCode });
        } else {
          resolve({ service: service.name, status: 'warning', code: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      const timestamp = new Date().toISOString();
      console.log(`❌ [${timestamp}] ${service.name} - Error: ${error.message}`);
      reject({ service: service.name, status: 'error', error: error.message });
    });

    req.on('timeout', () => {
      const timestamp = new Date().toISOString();
      console.log(`⏰ [${timestamp}] ${service.name} - Timeout`);
      req.destroy();
      reject({ service: service.name, status: 'timeout', error: 'Request timeout' });
    });

    req.end();
  });
}

// Main function to ping all services
async function keepAlive() {
  console.log(`🚀 Starting keep-alive ping at ${new Date().toISOString()}`);
  console.log(`📊 Monitoring ${SERVICES.length} services...\n`);

  const results = [];
  
  for (const service of SERVICES) {
    try {
      const result = await pingService(service);
      results.push(result);
    } catch (error) {
      results.push(error);
    }
  }

  // Summary
  console.log('\n📈 Summary:');
  const successful = results.filter(r => r.status === 'success').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const errors = results.filter(r => r.status === 'error' || r.status === 'timeout').length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Errors: ${errors}`);
  
  if (errors > 0) {
    console.log('\n🔧 Services with issues:');
    results.filter(r => r.status === 'error' || r.status === 'timeout')
      .forEach(r => console.log(`   - ${r.service}: ${r.error}`));
  }
  
  console.log(`\n✨ Keep-alive completed at ${new Date().toISOString()}\n`);
}

// Run the keep-alive function
keepAlive().catch(console.error);

// Export for use in other scripts
module.exports = { keepAlive, pingService }; 