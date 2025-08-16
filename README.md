# 🏛️ SigSegV Ceylon Smart Citizen Platform

A comprehensive digital governance platform for Sri Lankan citizens, providing secure authentication, government services, and citizen engagement tools.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

Ceylon Smart Citizen is a modern, secure, and scalable digital platform designed to streamline government services for Sri Lankan citizens. The platform provides a unified interface for citizens to access various government services, manage their profiles, and interact with government agencies digitally.

### Key Objectives
- **Digital Transformation**: Modernize government service delivery
- **Citizen Empowerment**: Provide easy access to government services
- **Security First**: Implement robust security measures for sensitive data
- **Multi-language Support**: Support for Sinhala, Tamil, and English
- **Accessibility**: Ensure platform accessibility for all citizens

## ✨ Features

### 🔐 Authentication & Security
- **Multi-factor Authentication (MFA)**: TOTP-based 2FA with QR code setup
- **JWT Token Management**: Secure access and refresh token system
- **Session Management**: Track and manage active user sessions
- **Password Security**: Advanced password hashing with bcrypt
- **Rate Limiting**: Protection against brute force attacks
- **Account Management**: Secure account deactivation and recovery

### 👤 User Management
- **Profile Management**: Comprehensive user profile system
- **NIC Validation**: Sri Lankan NIC number validation and verification
- **Language Preferences**: Multi-language support (EN/SI/TA)
- **Contact Management**: Email and phone number management
- **Address Management**: District-wise address management

### 🛡️ Data Protection & Compliance
- **GDPR Compliance**: Right to data portability and deletion
- **Data Export**: Complete user data export in JSON format
- **Audit Logging**: Comprehensive audit trail for all actions
- **Privacy Controls**: User-controlled privacy settings
- **Data Encryption**: End-to-end data encryption

### 📱 Digital Services
- **Government Service Integration**: Connect with various government APIs
- **Document Management**: Secure document upload and management
- **Notification System**: Real-time notifications and alerts
- **Service History**: Track service usage and history
- **Mobile Responsive**: Optimized for mobile and desktop

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Backend       │
│                 │    │                 │    │   Services      │
│ - Web Dashboard │◄──►│ - Route         │◄──►│ - Auth Service  │
│ - Mobile App    │    │   Management    │    │ - User Service  │
│ - Admin Panel   │    │ - Rate Limiting │    │ - Gov Services  │
└─────────────────┘    │ - Authentication│    └─────────────────┘
                       └─────────────────┘              │
                                                        │
                              ┌─────────────────────────┼─────────────────┐
                              │                         ▼                 │
                    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
                    │   PostgreSQL    │    │      Redis      │    │   File Storage  │
                    │   Database      │    │     Cache       │    │                 │
                    │ - User Data     │    │ - Sessions      │    │ - Documents     │
                    │ - Audit Logs    │    │ - Rate Limits   │    │ - Images        │
                    │ - System Config │    │ - Temp Data     │    │ - Exports       │
                    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technologies

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Docker** - Containerization

### Frontend
- **React** - Web application framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client

### DevOps & Infrastructure
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancer
- **pgAdmin** - Database administration
- **GitHub Actions** - CI/CD pipeline

### Security
- **TOTP** - Two-factor authentication
- **HTTPS** - Encrypted communication
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection
- **Input Validation** - XSS and injection prevention

## 🚀 Getting Started

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Node.js** 18+ (for local development)
- **PostgreSQL** 14+ (if not using Docker)
- **Git** for version control

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/CeylonSmartCitizen/SigSegV_CeylonSmartCitizen.git
   cd SigSegV_CeylonSmartCitizen
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment templates
   cp .env.example .env
   
   # Edit environment variables
   # Update database credentials, JWT secrets, etc.
   ```

3. **Start with Docker Compose**
   ```bash
   # Start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop services
   docker-compose down
   ```

4. **Access the Platform**
   - **Web Dashboard**: http://localhost:3000
   - **API Gateway**: http://localhost:8080
   - **Auth Service**: http://localhost:3001
   - **pgAdmin**: http://localhost:5050

## 💻 Installation

### Local Development Setup

1. **Backend Services Setup**
   ```bash
   # Navigate to auth service
   cd backend/services/auth-service
   
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env
   
   # Run database migrations
   npm run migrate
   
   # Start the service
   npm start
   ```

2. **Frontend Setup**
   ```bash
   # Navigate to web dashboard
   cd frontend/web-dashboard
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

3. **Database Setup**
   ```bash
   # Using Docker for PostgreSQL
   docker run --name ceylon-postgres \
     -e POSTGRES_DB=ceylon_smart_citizen \
     -e POSTGRES_USER=ceylon_user \
     -e POSTGRES_PASSWORD=your_password \
     -p 5432:5432 -d postgres:14
   
   # Run schema setup
   psql -h localhost -U ceylon_user -d ceylon_smart_citizen -f backend/shared/database/schema.sql
   ```

## 📖 Usage

### User Registration
```bash
POST /api/auth/register
{
  "email": "citizen@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "nicNumber": "200012345678",
  "phoneNumber": "+94771234567",
  "preferredLanguage": "en"
}
```

### User Login
```bash
POST /api/auth/login
{
  "email": "citizen@example.com",
  "password": "SecurePassword123!"
}
```

### Enable Two-Factor Authentication
```bash
POST /api/auth/2fa/setup
Authorization: Bearer <access_token>
```

### Export User Data (GDPR)
```bash
GET /api/auth/export-data
Authorization: Bearer <access_token>
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh-token` | Refresh access token | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Session Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/sessions` | Get active sessions | Yes |
| DELETE | `/api/auth/logout-session/:id` | Logout specific session | Yes |
| POST | `/api/auth/logout-all-sessions` | Logout all sessions | Yes |

### Two-Factor Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/2fa/setup` | Setup 2FA | Yes |
| POST | `/api/auth/2fa/verify` | Verify 2FA token | Yes |
| DELETE | `/api/auth/2fa/disable` | Disable 2FA | Yes |

### Account Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/export-data` | Export user data | Yes |
| POST | `/api/auth/deactivate-account` | Deactivate account | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |

## 🗄️ Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nic_number VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    preferred_language VARCHAR(5) DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Sessions Table
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_token VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_accessed TIMESTAMP DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET
);
```

#### Two-Factor Authentication
```sql
CREATE TABLE two_factor_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    secret VARCHAR(255) NOT NULL,
    backup_codes TEXT[],
    enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Security Tables

#### Password Reset Tokens
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Audit Logs
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Security

### Security Features Implemented

1. **Authentication Security**
   - JWT tokens with short expiration times
   - Refresh token rotation
   - Token blacklisting for logout
   - Password strength validation
   - Account lockout after failed attempts

2. **Data Protection**
   - bcrypt password hashing (12 rounds)
   - Input validation and sanitization
   - SQL injection prevention
   - XSS protection
   - CSRF protection

3. **API Security**
   - Rate limiting on all endpoints
   - CORS configuration
   - Request size limits
   - Headers security (helmet.js)
   - API versioning

4. **Infrastructure Security**
   - Docker container isolation
   - Environment variable management
   - Database connection encryption
   - Audit logging for all actions

### Security Configuration

```javascript
// JWT Configuration
const JWT_CONFIG = {
  accessToken: {
    expiresIn: '15m',
    algorithm: 'HS256'
  },
  refreshToken: {
    expiresIn: '7d',
    algorithm: 'HS256'
  }
};

// Password Security
const PASSWORD_CONFIG = {
  saltRounds: 12,
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true
};
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run authentication tests
npm run test:auth

# Run integration tests
npm run test:integration

# Run security tests
npm run test:security

# Generate coverage report
npm run test:coverage
```

### Test Authentication (Docker)

```bash
# Start services
docker-compose up -d

# Run authentication test
./test_auth_final.ps1
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Production environment variables
   NODE_ENV=production
   JWT_SECRET=your-super-secure-jwt-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   REDIS_URL=redis://redis:6379
   ```

2. **Docker Production Build**
   ```bash
   # Build production images
   docker-compose -f docker-compose.prod.yml build
   
   # Deploy to production
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Database Migration**
   ```bash
   # Run migrations
   docker exec ceylon-auth-service npm run migrate:prod
   
   # Seed initial data
   docker exec ceylon-auth-service npm run seed:prod
   ```

### Health Checks

```bash
# Check service health
curl http://localhost:3001/health

# Check database connectivity
curl http://localhost:3001/health/db

# Check Redis connectivity
curl http://localhost:3001/health/redis
```

## 📊 Monitoring

### Application Metrics
- Request/response times
- Error rates and status codes
- Database connection pool status
- Memory and CPU usage
- Active user sessions

### Security Monitoring
- Failed login attempts
- Rate limit violations
- Suspicious IP addresses
- Account lockouts
- Data export requests

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Code Standards

- **ESLint** configuration for code quality
- **Prettier** for code formatting
- **Conventional Commits** for commit messages
- **Jest** for testing
- **JSDoc** for documentation

### Project Structure

```
SigSegV_CeylonSmartCitizen/
├── backend/
│   ├── api-gateway/          # API Gateway service
│   ├── services/
│   │   └── auth-service/     # Authentication service
│   └── shared/
│       └── database/         # Database schemas and migrations
├── frontend/
│   ├── web-dashboard/        # React web application
│   └── mobile-app/          # Mobile application
├── docs/                    # Documentation
├── docker-compose.yml       # Docker services configuration
└── README.md               # This file
```

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ User authentication and authorization
- ✅ Multi-factor authentication
- ✅ Session management
- ✅ Data export capabilities
- ✅ Multi-language support

### Phase 2 (Next)
- 🔄 Government service integration
- 🔄 Document management system
- 🔄 Mobile application
- 🔄 Push notifications
- 🔄 Advanced analytics

### Phase 3 (Future)
- 📅 AI-powered chatbot
- 📅 Blockchain integration
- 📅 Advanced reporting
- 📅 Third-party API integrations
- 📅 Performance optimizations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/CeylonSmartCitizen/SigSegV_CeylonSmartCitizen/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CeylonSmartCitizen/SigSegV_CeylonSmartCitizen/discussions)

### Contact

- **Project Maintainer**: Ceylon Smart Citizen Team
- **Email**: support@ceylonsmartcitizen.gov.lk
- **Website**: https://ceylonsmartcitizen.gov.lk

---

## 🎯 Quick Commands

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f auth-service

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build -d

# Run tests
./test_auth_final.ps1

# Check health
curl http://localhost:3001/health
```

---

**Made with ❤️ for Sri Lankan Citizens**

*Empowering digital governance through secure, accessible, and user-friendly technology.*
