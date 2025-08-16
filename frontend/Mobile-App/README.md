# Ceylon Smart Citizen Mobile App 📱

A comprehensive React Native mobile application built with Expo for government service management, featuring authentication, service booking, queue management, and document upload capabilities.

## 🚀 Features

### 🔐 Authentication & User Management
- **Login/Register**: Email and password authentication
- **Biometric Authentication**: Fingerprint and Face ID support
- **Profile Management**: Complete user profile with image upload
- **Security Settings**: Password change, two-factor authentication

### 🏛️ Government Services
- **Service Discovery**: Browse and search available government services
- **Service Details**: Comprehensive information about each service
- **Service Booking**: Schedule appointments for government services
- **Requirements Checker**: View required documents and eligibility

### ⏰ Queue Management & Real-time Features
- **Real-time Queue Status**: Live position tracking and wait times
- **Queue Notifications**: Push notifications for queue updates
- **Position Tracking**: See how many people are ahead of you
- **Estimated Wait Time**: Dynamic time calculations

### 📄 Document Management
- **Document Upload**: Camera integration for document capture
- **Document Scanner**: Automatic document detection and cropping
- **File Support**: PDF, images, and other document formats
- **Upload Progress**: Real-time upload status and validation

### 🔔 Notifications
- **Push Notifications**: Real-time alerts and updates
- **Notification Center**: Organized message management
- **Notification Settings**: Customizable preferences
- **Multi-type Notifications**: Appointments, queue, documents, general

### 🌍 Multi-language Support
- **English**: Default language
- **Sinhala (සිංහල)**: Native Sri Lankan language
- **Tamil (தமிழ்)**: Regional language support
- **RTL Support**: Right-to-left text rendering

## 🛠️ Technology Stack

### Core Framework
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Navigation library

### State Management
- **Redux Toolkit**: Modern Redux state management
- **Redux Persist**: State persistence
- **React Redux**: React bindings for Redux

### UI & Styling
- **React Native Paper**: Material Design components
- **React Native Elements**: Additional UI components
- **Custom Theme System**: Consistent design tokens

### Internationalization
- **react-i18next**: Internationalization framework
- **Multi-language Support**: English, Sinhala, Tamil

### Device Features
- **Expo Camera**: Camera integration
- **Expo Image Picker**: Photo selection
- **Expo Document Picker**: File selection
- **Expo Local Authentication**: Biometric authentication
- **Expo Notifications**: Push notifications

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Expo CLI**: Development tooling

## 📁 Project Structure

```
Mobile-App/
├── App.js                          # Main application entry point
├── package.json                    # Project dependencies and scripts
├── app.json                        # Expo configuration
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── common/                # Common components
│   │   ├── forms/                 # Form components
│   │   └── ui/                    # UI-specific components
│   ├── constants/                 # App constants and configuration
│   │   ├── theme.js              # Design system and theme
│   │   ├── colors.js             # Color palette
│   │   └── config.js             # App configuration
│   ├── hooks/                     # Custom React hooks
│   ├── i18n/                      # Internationalization
│   │   ├── i18n.js               # i18n configuration
│   │   └── locales/              # Translation files
│   │       ├── en.json           # English translations
│   │       ├── si.json           # Sinhala translations
│   │       └── ta.json           # Tamil translations
│   ├── navigation/                # Navigation configuration
│   │   ├── AppNavigator.js       # Main navigation wrapper
│   │   ├── AuthNavigator.js      # Authentication screens navigation
│   │   ├── MainTabNavigator.js   # Main tab navigation
│   │   └── StackNavigators.js    # Stack navigators
│   ├── screens/                   # Application screens
│   │   ├── auth/                 # Authentication screens
│   │   ├── services/             # Government services screens
│   │   ├── appointments/         # Appointment management screens
│   │   ├── queue/                # Queue management screens
│   │   ├── documents/            # Document management screens
│   │   ├── notifications/        # Notification screens
│   │   ├── profile/              # User profile screens
│   │   └── settings/             # Settings screens
│   ├── services/                  # API and external services
│   │   ├── api.js                # API configuration and interceptors
│   │   ├── authService.js        # Authentication API calls
│   │   ├── userService.js        # User management API calls
│   │   └── notificationService.js # Notification services
│   ├── store/                     # Redux store configuration
│   │   ├── store.js              # Store setup and persistence
│   │   └── slices/               # Redux slices
│   │       ├── authSlice.js      # Authentication state
│   │       ├── userSlice.js      # User profile state
│   │       ├── servicesSlice.js  # Services state
│   │       ├── appointmentsSlice.js # Appointments state
│   │       ├── queueSlice.js     # Queue management state
│   │       └── notificationsSlice.js # Notifications state
│   ├── types/                     # TypeScript type definitions
│   └── utils/                     # Utility functions
└── assets/                        # Static assets (images, fonts, etc.)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Expo CLI: `npm install -g @expo/cli`
- Android Studio (for Android development)
- Xcode (for iOS development - Mac only)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd SigSegV_CeylonSmartCitizen/frontend/Mobile-App
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
# or
expo start
```

4. **Run on device/simulator**
- **Android**: Press `a` in the terminal or scan QR code with Expo Go app
- **iOS**: Press `i` in the terminal (Mac only) or scan QR code with Expo Go app
- **Web**: Press `w` in the terminal to open in browser

### Quick Start Script
Use the PowerShell script for easy startup:
```powershell
.\start-app.ps1
```

## 📱 Application Screens

### Authentication Flow
- **LoginScreen**: User authentication with email/password
- **RegisterScreen**: New user registration
- **ForgotPasswordScreen**: Password recovery
- **BiometricSetupScreen**: Biometric authentication setup

### Main Application
- **ServicesListScreen**: Browse available government services
- **ServiceDetailsScreen**: Detailed service information
- **BookingFormScreen**: Service appointment booking
- **QueueDashboardScreen**: Real-time queue management
- **QueuePositionScreen**: Current queue position tracking
- **DocumentUploadScreen**: Document capture and upload
- **NotificationsListScreen**: Notification center
- **ProfileScreen**: User profile management
- **EditProfileScreen**: Profile editing
- **SettingsScreen**: Application settings

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
API_BASE_URL=https://your-api-server.com
EXPO_PUBLIC_API_URL=https://your-api-server.com
```

### API Configuration
Update `src/services/api.js` with your backend API endpoints:
```javascript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
```

### Theme Customization
Modify `src/constants/theme.js` to customize the app's appearance:
```javascript
export const colors = {
  primary: '#1976D2',
  secondary: '#FF6B6B',
  // ... other colors
};
```

## 🌍 Internationalization

The app supports multiple languages:
- **English (en)**: Default language
- **Sinhala (si)**: සිංහල
- **Tamil (ta)**: தமிழ்

### Adding New Languages
1. Create a new translation file in `src/i18n/locales/`
2. Add the language to `src/i18n/i18n.js`
3. Update the language selector in settings

### Translation Keys
Use the `useTranslation` hook:
```javascript
const { t } = useTranslation();
return <Text>{t('welcomeMessage')}</Text>;
```

## 🔔 Push Notifications

The app includes comprehensive push notification support:
- **Registration**: Automatic device token registration
- **Categories**: Appointment, queue, document, and general notifications
- **Settings**: User-customizable notification preferences
- **Real-time**: Live updates for queue status and appointments

## 📸 Camera & Document Features

### Camera Integration
- **Document Capture**: High-quality document photography
- **Auto-focus**: Automatic document detection
- **Multiple Formats**: Support for various document types

### Document Upload
- **Progress Tracking**: Real-time upload progress
- **Format Validation**: Automatic file type checking
- **Compression**: Optimized file sizes for faster upload

## 🔒 Security Features

### Authentication Security
- **JWT Tokens**: Secure authentication tokens
- **Biometric Authentication**: Fingerprint and Face ID
- **Auto-logout**: Automatic session expiration
- **Secure Storage**: Encrypted token storage

### Data Protection
- **API Security**: Request/response encryption
- **Local Storage**: Secure data persistence
- **Privacy Controls**: User data management

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 📦 Building for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

### App Store Deployment
```bash
expo submit:android
expo submit:ios
```

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler cache issues**
```bash
expo start -c
```

2. **Node modules conflicts**
```bash
rm -rf node_modules package-lock.json
npm install
```

3. **Expo CLI issues**
```bash
npm install -g @expo/cli@latest
```

### Debug Mode
Enable debug mode in development:
```javascript
// In App.js
console.log('Debug mode enabled');
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

### Development Team
- **Inothma**: Authentication & Security Features
- **Pavith**: Services Discovery & Booking System
- **Shalon**: Queue Management & Real-time Features

### Technical Lead
- Senior Frontend React Native Developer

## 📞 Support

For support and questions:
- Email: support@ceylonsmartcitizen.lk
- Phone: +94 11 123 4567
- Website: https://ceylonsmartcitizen.lk

## 🔗 Related Projects

- **Backend API**: Government services backend
- **Web Dashboard**: Administrative web interface
- **API Gateway**: Service routing and authentication

---

**Ceylon Smart Citizen Mobile App v1.0.0**  
© 2024 Ceylon Smart Citizen Initiative. All rights reserved.
