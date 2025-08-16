// src/components/common/LanguageSwitcher.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants/theme';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇱🇰' },
];

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => void;
}

const LanguageSwitcher = ({
  currentLanguage,
  onLanguageChange,
}: LanguageSwitcherProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode);
    setModalVisible(false);
  };

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        item.code === currentLanguage && styles.selectedLanguageItem,
      ]}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <View style={styles.languageText}>
        <Text style={[
          styles.languageName,
          item.code === currentLanguage && styles.selectedText,
        ]}>
          {item.name}
        </Text>
        <Text style={[
          styles.nativeName,
          item.code === currentLanguage && styles.selectedText,
        ]}>
          {item.nativeName}
        </Text>
      </View>
      {item.code === currentLanguage && (
        <Ionicons name="checkmark" size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        style={styles.switcher}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.flag}>{currentLang.flag}</Text>
        <Text style={styles.currentLanguage}>{currentLang.code.toUpperCase()}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={languages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flag: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  currentLanguage: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight as any,
    color: colors.textPrimary,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedLanguageItem: {
    backgroundColor: colors.background,
  },
  languageText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  languageName: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  nativeName: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectedText: {
    color: colors.primary,
  },
});

export default LanguageSwitcher;
