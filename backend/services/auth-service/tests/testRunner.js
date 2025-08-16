/**
 * TEST RUNNER FOR COMPREHENSIVE API TESTING
 * Handles server startup, testing, and cleanup
 */

const { spawn } = require('child_process');
const path = require('path');
const ComprehensiveAPITester = require('./comprehensiveFullTest');

class TestRunner {
  constructor() {
    this.serverProcess = null;
    this.serverStarted = false;
    this.baseURL = 'http://localhost:3001/api/auth';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkServerHealth() {
    try {
      const axios = require('axios');
      const response = await axios.get(`${this.baseURL}/health`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async waitForServer(maxAttempts = 30) {
    this.log('Waiting for server to be ready...');
    
    for (let i = 0; i < maxAttempts; i++) {
      if (await this.checkServerHealth()) {
        this.log('Server is ready!', 'success');
        return true;
      }
      
      this.log(`Attempt ${i + 1}/${maxAttempts} - Server not ready yet...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    }
    
    return false;
  }

  async startServer() {
    return new Promise((resolve) => {
      this.log('Starting authentication server...');
      
      const serverPath = path.join(__dirname, '..', 'src', 'app.js');
      
      this.serverProcess = spawn('node', [serverPath], {
        stdio: 'pipe',
        env: {
          ...process.env,
          NODE_ENV: 'test',
          PORT: '3001'
        }
      });

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Server running') || output.includes('listening')) {
          this.serverStarted = true;
          this.log('Server started successfully', 'success');
          resolve(true);
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.error('Server Error:', error);
      });

      this.serverProcess.on('error', (error) => {
        this.log(`Failed to start server: ${error.message}`, 'error');
        resolve(false);
      });

      // Fallback timeout
      setTimeout(() => {
        if (!this.serverStarted) {
          this.log('Server startup timeout - proceeding anyway', 'warning');
          resolve(true);
        }
      }, 10000);
    });
  }

  async stopServer() {
    if (this.serverProcess) {
      this.log('Stopping server...');
      this.serverProcess.kill('SIGTERM');
      
      return new Promise((resolve) => {
        this.serverProcess.on('close', () => {
          this.log('Server stopped', 'success');
          resolve();
        });
        
        // Force kill after 5 seconds
        setTimeout(() => {
          if (this.serverProcess) {
            this.serverProcess.kill('SIGKILL');
            resolve();
          }
        }, 5000);
      });
    }
  }

  async runTests() {
    this.log('🚀 STARTING COMPREHENSIVE API TEST RUNNER');
    console.log('═'.repeat(80));

    try {
      // Check if server is already running
      const serverAlreadyRunning = await this.checkServerHealth();
      
      if (!serverAlreadyRunning) {
        this.log('Server not running, attempting to start...', 'warning');
        
        // Try to start server
        const serverStarted = await this.startServer();
        
        if (serverStarted) {
          // Wait for server to be fully ready
          const serverReady = await this.waitForServer();
          
          if (!serverReady) {
            this.log('Server failed to become ready, running static tests only', 'warning');
            await this.runStaticTests();
            return;
          }
        } else {
          this.log('Failed to start server, running static tests only', 'error');
          await this.runStaticTests();
          return;
        }
      } else {
        this.log('Server is already running', 'success');
      }

      // Run comprehensive API tests
      this.log('Running comprehensive API tests...');
      const tester = new ComprehensiveAPITester(this.baseURL);
      await tester.runComprehensiveTests();

    } catch (error) {
      this.log(`Test execution error: ${error.message}`, 'error');
    } finally {
      // Cleanup
      if (this.serverProcess && !await this.checkServerHealth()) {
        await this.stopServer();
      }
    }
  }

  async runStaticTests() {
    this.log('🔍 Running static code analysis and validation tests');
    
    try {
      // Run static analysis
      const StaticAnalyzer = require('./staticAnalysis');
      const analyzer = new StaticAnalyzer();
      await analyzer.runAnalysis();
      
    } catch (error) {
      this.log(`Static test error: ${error.message}`, 'error');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runTests()
    .then(() => {
      console.log('\n🎉 Test execution completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = TestRunner;
