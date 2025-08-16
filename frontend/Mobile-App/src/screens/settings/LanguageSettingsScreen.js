import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const LanguageSettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
    },
    {
      code: 'si',
      name: 'Sinhala',
      nativeName: 'සිංහල',
      flag: '🇱🇰',
    },
    {
      code: 'ta',
      name: 'Tamil',
      nativeName: 'தமிழ்',
      flag: '🇱🇰',
    },
  ];

  const handleLanguageChange = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      setSelectedLanguage(languageCode);
      Alert.alert(t('success'), t('languageChanged'));
    } catch (error) {
      Alert.alert(t('error'), t('languageChangeError'));
    }
  };

  const renderLanguageOption = (language) => (
    <TouchableOpacity
      key={language.code}
      style={styles.languageOption}
      onPress={() => handleLanguageChange(language.code)}
    >
      <View style={styles.languageInfo}>
        <Text style={styles.languageFlag}>{language.flag}</Text>
        <View style={styles.languageText}>
          <Text style={styles.languageName}>{language.name}</Text>
          <Text style={styles.languageNative}>{language.nativeName}</Text>
        </View>
      </View>
      
      <View style={styles.radioButton}>
        {selectedLanguage === language.code && (
          <View style={styles.radioButtonSelected} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('language')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('selectLanguage')}</Text>
          <Text style={styles.sectionDescription}>
            {t('chooseYourPreferredLanguage')}
          </Text>
          
          {languages.map(renderLanguageOption)}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>{t('languageNote')}</Text>
              <Text style={styles.infoDescription}>
                {t('languageChangeNote')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.body,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  languageNative: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
    padding: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default LanguageSettingsScreen;
