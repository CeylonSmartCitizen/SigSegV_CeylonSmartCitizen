import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'react-native-localize';
import { STORAGE_KEYS } from '../constants/config';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      search: 'Search',
      
      // Authentication
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      
      // Profile
      profile: 'Profile',
      editProfile: 'Edit Profile',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      address: 'Address',
      dateOfBirth: 'Date of Birth',
      nic: 'NIC Number',
      
      // Services
      services: 'Services',
      serviceDetails: 'Service Details',
      bookAppointment: 'Book Appointment',
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      appointmentBooked: 'Appointment Booked Successfully',
      
      // Queue
      queue: 'Queue',
      queuePosition: 'Queue Position',
      estimatedWaitTime: 'Estimated Wait Time',
      peopleAhead: 'People Ahead',
      joinQueue: 'Join Queue',
      leaveQueue: 'Leave Queue',
      inQueue: 'In Queue',
      
      // Notifications
      notifications: 'Notifications',
      markAllRead: 'Mark All as Read',
      noNotifications: 'No notifications',
      
      // Documents
      documents: 'Documents',
      uploadDocument: 'Upload Document',
      takePhoto: 'Take Photo',
      chooseFromGallery: 'Choose from Gallery',
      
      // Language
      language: 'Language',
      english: 'English',
      sinhala: 'Sinhala',
      tamil: 'Tamil',
      
      // Settings
      settings: 'Settings',
      changePassword: 'Change Password',
      notificationSettings: 'Notification Settings',
      pushNotifications: 'Push Notifications',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      
      // Errors
      invalidEmail: 'Please enter a valid email address',
      passwordTooShort: 'Password must be at least 6 characters',
      passwordsDoNotMatch: 'Passwords do not match',
      fieldRequired: 'This field is required',
      loginFailed: 'Login failed. Please check your credentials.',
      registrationFailed: 'Registration failed. Please try again.',
      networkError: 'Network error. Please check your connection.',
    },
  },
  si: {
    translation: {
      // Common
      loading: 'පූරණය වෙමින්...',
      error: 'දෝෂයක්',
      retry: 'නැවත උත්සාහ කරන්න',
      cancel: 'අවලංගු කරන්න',
      confirm: 'තහවුරු කරන්න',
      save: 'සුරකින්න',
      edit: 'සංස්කරණය',
      delete: 'මකන්න',
      back: 'ආපසු',
      next: 'ඊළඟ',
      submit: 'ඉදිරිපත් කරන්න',
      search: 'සොයන්න',
      
      // Authentication
      login: 'පිවිසෙන්න',
      register: 'ලියාපදිංචි වන්න',
      logout: 'ඉවත් වන්න',
      email: 'විද්‍යුත් තැපෑල',
      password: 'මුරපදය',
      confirmPassword: 'මුරපදය තහවුරු කරන්න',
      forgotPassword: 'මුරපදය අමතකද?',
      rememberMe: 'මා මතක තබා ගන්න',
      createAccount: 'ගිණුමක් සාදන්න',
      alreadyHaveAccount: 'දැනටමත් ගිණුමක් තිබේද?',
      dontHaveAccount: 'ගිණුමක් නැද්ද?',
      
      // Profile
      profile: 'පැතිකඩ',
      editProfile: 'පැතිකඩ සංස්කරණය කරන්න',
      firstName: 'මුල් නම',
      lastName: 'අවසාන නම',
      phone: 'දුරකථන අංකය',
      address: 'ලිපිනය',
      dateOfBirth: 'උපන් දිනය',
      nic: 'ජා.හැ.අං.',
      
      // Services
      services: 'සේවා',
      serviceDetails: 'සේවා විස්තර',
      bookAppointment: 'හමුවීමක් වෙන් කරන්න',
      selectDate: 'දිනය තෝරන්න',
      selectTime: 'වේලාව තෝරන්න',
      appointmentBooked: 'හමුවීම සාර්ථකව වෙන් කරන ලදී',
      
      // Queue
      queue: 'පෝලිම',
      queuePosition: 'පෝලිමේ ස්ථානය',
      estimatedWaitTime: 'ඇස්තමේන්තුගත රැඳී සිටීමේ කාලය',
      peopleAhead: 'ඉදිරියේ සිටින පුද්ගලයින්',
      joinQueue: 'පෝලිමට සම්බන්ධ වන්න',
      leaveQueue: 'පෝලිමෙන් ඉවත් වන්න',
      inQueue: 'පෝලිමේ',
      
      // Notifications
      notifications: 'දැනුම්දීම්',
      markAllRead: 'සියල්ල කියවා ඇති ලෙස සලකුණු කරන්න',
      noNotifications: 'දැනුම්දීම් නැත',
      
      // Documents
      documents: 'ලේඛන',
      uploadDocument: 'ලේඛනය උඩුගත කරන්න',
      takePhoto: 'ඡායාරූපයක් ගන්න',
      chooseFromGallery: 'ගැලරියෙන් තෝරන්න',
      
      // Language
      language: 'භාෂාව',
      english: 'ඉංග්‍රීසි',
      sinhala: 'සිංහල',
      tamil: 'දමිළ',
      
      // Settings
      settings: 'සැකසුම්',
      changePassword: 'මුරපදය වෙනස් කරන්න',
      notificationSettings: 'දැනුම්දීම් සැකසුම්',
      pushNotifications: 'තල්ලු දැනුම්දීම්',
      emailNotifications: 'ඊමේල් දැනුම්දීම්',
      smsNotifications: 'SMS දැනුම්දීම්',
    },
  },
  ta: {
    translation: {
      // Common
      loading: 'ஏற்றுகிறது...',
      error: 'பிழை',
      retry: 'மீண்டும் முயற்சி செய்க',
      cancel: 'ரத்து செய்',
      confirm: 'உறுதிப்படுத்து',
      save: 'சேமி',
      edit: 'திருத்து',
      delete: 'நீக்கு',
      back: 'பின்',
      next: 'அடுத்து',
      submit: 'சமர்ப்பிக்க',
      search: 'தேடு',
      
      // Authentication
      login: 'உள்நுழை',
      register: 'பதிவு செய்',
      logout: 'வெளியேறு',
      email: 'மின்னஞ்சல்',
      password: 'கடவுச்சொல்',
      confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
      forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
      rememberMe: 'என்னை நினைவில் வைத்துக்கொள்',
      createAccount: 'கணக்கை உருவாக்கு',
      alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
      dontHaveAccount: 'கணக்கு இல்லையா?',
      
      // Profile
      profile: 'விவரக்குறிப்பு',
      editProfile: 'விவரக்குறிப்பைத் திருத்து',
      firstName: 'முதல் பெயர்',
      lastName: 'கடைசி பெயர்',
      phone: 'தொலைபேசி எண்',
      address: 'முகவரி',
      dateOfBirth: 'பிறந்த தேதி',
      nic: 'அடையாள அட்டை எண்',
      
      // Services
      services: 'சேவைகள்',
      serviceDetails: 'சேவை விவரங்கள்',
      bookAppointment: 'சந்திப்பு பதிவு செய்',
      selectDate: 'தேதியைத் தேர்ந்தெடுக்கவும்',
      selectTime: 'நேரத்தைத் தேர்ந்தெடுக்கவும்',
      appointmentBooked: 'சந்திப்பு வெற்றிகரமாக பதிவு செய்யப்பட்டது',
      
      // Queue
      queue: 'வரிசை',
      queuePosition: 'வரிசை நிலை',
      estimatedWaitTime: 'மதிப்பிடப்பட்ட காத்திருப்பு நேரம்',
      peopleAhead: 'முன்னால் உள்ளவர்கள்',
      joinQueue: 'வரிசையில் சேர்',
      leaveQueue: 'வரிசையை விட்டு வெளியேறு',
      inQueue: 'வரிசையில்',
      
      // Notifications
      notifications: 'அறிவிப்புகள்',
      markAllRead: 'அனைத்தையும் படித்ததாக குறி',
      noNotifications: 'அறிவிப்புகள் இல்லை',
      
      // Documents
      documents: 'ஆவணங்கள்',
      uploadDocument: 'ஆவணத்தை பதிவேற்றவும்',
      takePhoto: 'புகைப்படம் எடுக்கவும்',
      chooseFromGallery: 'கேலரியில் இருந்து தேர்வு செய்க',
      
      // Language
      language: 'மொழி',
      english: 'ஆங்கிலம்',
      sinhala: 'சிங்களம்',
      tamil: 'தமிழ்',
      
      // Settings
      settings: 'அமைப்புகள்',
      changePassword: 'கடவுச்சொல்லை மாற்று',
      notificationSettings: 'அறிவிப்பு அமைப்புகள்',
      pushNotifications: 'புஷ் அறிவிப்புகள்',
      emailNotifications: 'மின்னஞ்சல் அறிவிப்புகள்',
      smsNotifications: 'SMS அறிவிப்புகள்',
    },
  },
};

// Get saved language or use device language
const getInitialLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (savedLanguage) {
      return savedLanguage;
    }
    
    // Get device language
    const locales = Localization.getLocales();
    const deviceLanguage = locales[0]?.languageCode || 'en';
    
    // Check if we support the device language
    if (resources[deviceLanguage]) {
      return deviceLanguage;
    }
    
    return 'en'; // Default to English
  } catch (error) {
    return 'en';
  }
};

const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();
  
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      
      interpolation: {
        escapeValue: false,
      },
      
      react: {
        useSuspense: false,
      },
    });
};

// Initialize i18n
initI18n();

export const changeLanguage = async (language) => {
  await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  i18n.changeLanguage(language);
};

export default i18n;
