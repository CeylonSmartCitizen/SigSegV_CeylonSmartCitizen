const axios = require('axios');

// Docker service configurations
const services = {
  document: { port: 3003, name: 'Document Service', container: 'ceylon-document-service' },
  notification: { port: 3002, name: 'Notification Service', container: 'ceylon-notification-service' },
  queue: { port: 3005, name: 'Queue Service', container: 'ceylon-queue-service' },
  audit: { port: 3004, name: 'Audit Service', container: 'ceylon-audit-service' }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Logging functions
const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`)
};

// Test results tracking
let testResults = {
  services: {},
  summary: { total: 0, passed: 0, failed: 0 }
};

// Wait for service to be ready
async function waitForService(serviceName, port, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await axios.get(`http://localhost:${port}/`, { timeout: 2000 });
      return true;
    } catch (error) {
      if (i === maxRetries - 1) {
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

// Generic service health check
async function checkServiceHealth(serviceName, port) {
  try {
    const response = await axios.get(`http://localhost:${port}/`, { timeout: 5000 });
    testResults.services[serviceName] = { 
      status: 'UP', 
      port, 
      response: response.status,
      message: response.data 
    };
    log.success(`${services[serviceName].name} is running on port ${port}`);
    return true;
  } catch (error) {
    testResults.services[serviceName] = { 
      status: 'DOWN', 
      port, 
      error: error.code || error.message 
    };
    log.error(`${services[serviceName].name} is not accessible on port ${port}: ${error.message}`);
    return false;
  }
}

// Document Service Tests (port 3003 -> internal 3000)
async function testDocumentService() {
  log.header('\n=== Testing Document Service ===');
  const port = services.document.port;
  let serviceTests = { passed: 0, failed: 0, tests: [] };

  try {
    // Test 1: Health check
    const healthResponse = await axios.get(`http://localhost:${port}/`);
    serviceTests.passed++;
    serviceTests.tests.push({ name: 'Health Check', status: 'PASSED' });
    log.success('Document Service health check passed');

    // Test 2: Documents API endpoint
    try {
      const apiResponse = await axios.get(`http://localhost:${port}/documents`);
      serviceTests.passed++;
      serviceTests.tests.push({ name: 'Documents API', status: 'PASSED' });
      log.success('Documents API endpoint accessible');
    } catch (error) {
      serviceTests.failed++;
      serviceTests.tests.push({ name: 'Documents API', status: 'FAILED', error: error.message });
      log.warning(`Documents API test failed: ${error.message}`);
    }

  } catch (error) {
    serviceTests.failed++;
    serviceTests.tests.push({ name: 'Health Check', status: 'FAILED', error: error.message });
    log.error(`Document Service tests failed: ${error.message}`);
  }

  testResults.services.document = { ...testResults.services.document, ...serviceTests };
}

// Notification Service Tests
async function testNotificationService() {
  log.header('\n=== Testing Notification Service ===');
  const port = services.notification.port;
  let serviceTests = { passed: 0, failed: 0, tests: [] };

  try {
    // Test 1: Health check
    const healthResponse = await axios.get(`http://localhost:${port}/`);
    serviceTests.passed++;
    serviceTests.tests.push({ name: 'Health Check', status: 'PASSED' });
    log.success('Notification Service health check passed');

    // Test 2: Get notifications endpoint
    try {
      const notificationsResponse = await axios.get(`http://localhost:${port}/notifications`);
      serviceTests.passed++;
      serviceTests.tests.push({ name: 'Get Notifications', status: 'PASSED' });
      log.success('Get notifications endpoint accessible');
    } catch (error) {
      serviceTests.failed++;
      serviceTests.tests.push({ name: 'Get Notifications', status: 'FAILED', error: error.message });
      log.warning(`Get notifications test failed: ${error.message}`);
    }

  } catch (error) {
    serviceTests.failed++;
    serviceTests.tests.push({ name: 'Health Check', status: 'FAILED', error: error.message });
    log.error(`Notification Service tests failed: ${error.message}`);
  }

  testResults.services.notification = { ...testResults.services.notification, ...serviceTests };
}

// Queue Service Tests
async function testQueueService() {
  log.header('\n=== Testing Queue Service ===');
  const port = services.queue.port;
  let serviceTests = { passed: 0, failed: 0, tests: [] };

  try {
    // Test 1: Health check
    const healthResponse = await axios.get(`http://localhost:${port}/`);
    serviceTests.passed++;
    serviceTests.tests.push({ name: 'Health Check', status: 'PASSED' });
    log.success('Queue Service health check passed');

    // Test 2: Queue functionality
    try {
      const queueResponse = await axios.post(`http://localhost:${port}/queue/test-queue/position`, {
        position: 5,
        stats: { total: 20, served: 10, waiting: 10 }
      });
      serviceTests.passed++;
      serviceTests.tests.push({ name: 'Queue Position Update', status: 'PASSED' });
      log.success('Queue position update working');
    } catch (error) {
      serviceTests.failed++;
      serviceTests.tests.push({ name: 'Queue Position Update', status: 'FAILED', error: error.message });
      log.warning(`Queue position test failed: ${error.message}`);
    }

  } catch (error) {
    serviceTests.failed++;
    serviceTests.tests.push({ name: 'Health Check', status: 'FAILED', error: error.message });
    log.error(`Queue Service tests failed: ${error.message}`);
  }

  testResults.services.queue = { ...testResults.services.queue, ...serviceTests };
}

// Audit Service Tests
async function testAuditService() {
  log.header('\n=== Testing Audit Service ===');
  const port = services.audit.port;
  let serviceTests = { passed: 0, failed: 0, tests: [] };

  try {
    // Test 1: Health check
    const healthResponse = await axios.get(`http://localhost:${port}/`);
    serviceTests.passed++;
    serviceTests.tests.push({ name: 'Health Check', status: 'PASSED' });
    log.success('Audit Service health check passed');

  } catch (error) {
    serviceTests.failed++;
    serviceTests.tests.push({ name: 'Health Check', status: 'FAILED', error: error.message });
    log.error(`Audit Service tests failed: ${error.message}`);
  }

  testResults.services.audit = { ...testResults.services.audit, ...serviceTests };
}

// Generate test report
function generateReport() {
  log.header('\n' + '='.repeat(60));
  log.header('           DOCKER SERVICES TEST REPORT');
  log.header('='.repeat(60));

  Object.keys(services).forEach(serviceName => {
    const service = testResults.services[serviceName];
    log.info(`\n${services[serviceName].name}:`);
    log.info(`  Status: ${service.status}`);
    log.info(`  Port: ${service.port} (Host) -> Container: ${services[serviceName].container}`);
    
    if (service.tests) {
      log.info(`  Tests Passed: ${service.passed}`);
      log.info(`  Tests Failed: ${service.failed}`);
      service.tests.forEach(test => {
        if (test.status === 'PASSED') {
          log.success(`    ${test.name}`);
        } else {
          log.error(`    ${test.name}: ${test.error || 'Unknown error'}`);
        }
      });
    }
  });

  // Calculate totals
  const totalPassed = Object.values(testResults.services).reduce((sum, service) => sum + (service.passed || 0), 0);
  const totalFailed = Object.values(testResults.services).reduce((sum, service) => sum + (service.failed || 0), 0);
  
  log.header('\n' + '='.repeat(60));
  log.info(`SUMMARY: ${totalPassed} tests passed, ${totalFailed} tests failed`);
  
  const upServices = Object.values(testResults.services).filter(s => s.status === 'UP').length;
  const totalServices = Object.keys(services).length;
  log.info(`SERVICES: ${upServices}/${totalServices} services are running`);
  log.header('='.repeat(60));

  return { totalPassed, totalFailed, upServices, totalServices };
}

// Main test runner
async function runDockerTests() {
  log.header('🐳 Docker Support Services Test Suite');
  log.info('Testing services via Docker containers...\n');

  // Wait for all services to be ready
  log.info('⏳ Waiting for services to start...');
  const servicePromises = Object.entries(services).map(([name, config]) => 
    waitForService(name, config.port).then(ready => ({ name, ready, port: config.port }))
  );
  
  const serviceReadiness = await Promise.all(servicePromises);
  
  log.info('\n=== Service Readiness Check ===');
  serviceReadiness.forEach(({ name, ready, port }) => {
    if (ready) {
      log.success(`${services[name].name} is ready on port ${port}`);
    } else {
      log.error(`${services[name].name} failed to start on port ${port}`);
    }
  });

  // Check service health
  log.info('\n=== Service Health Check ===');
  await Promise.all([
    checkServiceHealth('document', services.document.port),
    checkServiceHealth('notification', services.notification.port),
    checkServiceHealth('queue', services.queue.port),
    checkServiceHealth('audit', services.audit.port)
  ]);

  // Run detailed tests for services that are up
  if (testResults.services.document?.status === 'UP') await testDocumentService();
  if (testResults.services.notification?.status === 'UP') await testNotificationService();
  if (testResults.services.queue?.status === 'UP') await testQueueService();
  if (testResults.services.audit?.status === 'UP') await testAuditService();

  return generateReport();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log.warning('\nTest suite interrupted. Generating partial report...');
  generateReport();
  process.exit(0);
});

// Export for use as module
module.exports = { runDockerTests, services };

// Run tests if this file is executed directly
if (require.main === module) {
  runDockerTests()
    .then((results) => {
      process.exit(results.totalFailed > 0 ? 1 : 0);
    })
    .catch(error => {
      log.error(`Test suite failed: ${error.message}`);
      process.exit(1);
    });
}
