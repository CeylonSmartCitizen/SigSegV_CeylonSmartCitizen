import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

const languages = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    direction: 'ltr'
  },
  si: {
    code: 'si',
    name: 'සිංහල',
    flag: '🇱🇰',
    direction: 'ltr'
  },
  ta: {
    code: 'ta',
    name: 'தமிழ்',
    flag: '🇱🇰',
    direction: 'ltr'
  }
}

const translations = {
  en: {
    // Common
    welcome: 'Welcome',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Auth
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone Number',
    
    // Navigation
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    documents: 'Documents',
    profile: 'Profile',
    notifications: 'Notifications'
  },
  si: {
    // Common
    welcome: 'ස්වාගතම්',
    login: 'ප්‍රවේශය',
    register: 'ලියාපදිංචිය',
    logout: 'ඉවත්වීම',
    save: 'සුරකින්න',
    cancel: 'අවලංගු කරන්න',
    submit: 'ඉදිරිපත් කරන්න',
    loading: 'පූරණය වෙමින්...',
    error: 'දෝෂය',
    success: 'සාර්ථකය',
    
    // Auth
    email: 'විද්‍යුත් තැපෑල',
    password: 'මුරපදය',
    confirmPassword: 'මුරපදය තහවුරු කරන්න',
    firstName: 'මුල් නම',
    lastName: 'අන්තිම නම',
    phone: 'දුරකථන අංකය',
    
    // Navigation
    dashboard: 'උපකරණ පුවරුව',
    appointments: 'හමුවීම්',
    documents: 'ලේඛන',
    profile: 'පැතිකඩ',
    notifications: 'දැනුම්දීම්'
  },
  ta: {
    // Common
    welcome: 'வரவேற்கிறோம்',
    login: 'உள்நுழைய',
    register: 'பதிவு செய்ய',
    logout: 'வெளியேறு',
    save: 'சேமி',
    cancel: 'ரத்து செய்',
    submit: 'சமர்ப்பிக்க',
    loading: 'ஏற்றுகிறது...',
    error: 'பிழை',
    success: 'வெற்றி',
    
    // Auth
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்து',
    firstName: 'முதல் பெயர்',
    lastName: 'கடைசி பெயர்',
    phone: 'தொலைபேசி எண்',
    
    // Navigation
    dashboard: 'டாஷ்போர்டு',
    appointments: 'சந்திப்புகள்',
    documents: 'ஆவணங்கள்',
    profile: 'சுயவிவரம்',
    notifications: 'அறிவிப்புகள்'
  }
}

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage')
    if (savedLanguage && languages[savedLanguage]) {
      setCurrentLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (langCode) => {
    if (languages[langCode]) {
      setCurrentLanguage(langCode)
      localStorage.setItem('preferredLanguage', langCode)
    }
  }

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key
  }

  const value = {
    currentLanguage,
    languages,
    changeLanguage,
    t,
    isRTL: languages[currentLanguage]?.direction === 'rtl'
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
