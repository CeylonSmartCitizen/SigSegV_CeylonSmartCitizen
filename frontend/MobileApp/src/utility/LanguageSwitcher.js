import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import i18n from '../i18n';

export default function LanguageSwitcher() {
  // If you want to persist language selection to backend/user profile, uncomment and implement below when backend is ready.
  // const saveLanguageToBackend = async (lang) => {
  //   // await api.saveUserLanguage(lang);
  // };

  const changeLanguage = async (lang) => {
    await i18n.changeLanguage(lang);
    // Uncomment below to save language preference to backend when available
    // await saveLanguageToBackend(lang);
    // You may want to prompt user to restart app for full effect
  };

  return (
    <View style={styles.container}>
      <Button title="English" onPress={() => changeLanguage('en')} />
      <Button title="සිංහල" onPress={() => changeLanguage('si')} />
      <Button title="தமிழ்" onPress={() => changeLanguage('ta')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
});