import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { updateUserProfile } from '../../store/slices/userSlice';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const EditProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || '',
    nicNumber: user?.nicNumber || '',
    emergencyContact: user?.emergencyContact || '',
    emergencyContactPhone: user?.emergencyContactPhone || '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('phoneRequired');
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('invalidPhone');
    }

    if (formData.nicNumber && !/^[0-9]{9}[vVxX]|[0-9]{12}$/.test(formData.nicNumber)) {
      newErrors.nicNumber = t('invalidNIC');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      Alert.alert(t('success'), t('profileUpdated'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('error'), error.message || t('updateProfileError'));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const renderInput = (field, label, placeholder, options = {}) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        editable={!isLoading}
        {...options}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('editProfile')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          <Text style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}>
            {t('save')}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('personalInformation')}</Text>
            
            {renderInput('name', t('fullName'), t('enterFullName'))}
            
            {renderInput('email', t('email'), t('enterEmail'), {
              keyboardType: 'email-address',
              autoCapitalize: 'none',
            })}
            
            {renderInput('phone', t('phoneNumber'), t('enterPhoneNumber'), {
              keyboardType: 'phone-pad',
            })}
            
            {renderInput('dateOfBirth', t('dateOfBirth'), 'YYYY-MM-DD', {
              placeholder: 'YYYY-MM-DD',
            })}
            
            {renderInput('nicNumber', t('nicNumber'), t('enterNICNumber'), {
              autoCapitalize: 'characters',
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('addressInformation')}</Text>
            
            {renderInput('address', t('address'), t('enterAddress'), {
              multiline: true,
              numberOfLines: 3,
              textAlignVertical: 'top',
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('emergencyContact')}</Text>
            
            {renderInput('emergencyContact', t('contactName'), t('enterContactName'))}
            
            {renderInput('emergencyContactPhone', t('contactPhone'), t('enterContactPhone'), {
              keyboardType: 'phone-pad',
            })}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.updateButton, isLoading && styles.updateButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.updateButtonText}>
                {isLoading ? t('updating') : t('updateProfile')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: colors.textSecondary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  input: {
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  buttonContainer: {
    paddingVertical: spacing.xl,
  },
  updateButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  updateButtonText: {
    ...typography.buttonMedium,
    color: colors.surface,
  },
});

export default EditProfileScreen;
