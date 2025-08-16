import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { updateNotificationSettings } from '../../store/slices/notificationsSlice';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const NotificationSettingsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { settings, isLoading } = useSelector((state) => state.notifications);

  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: settings?.pushNotifications ?? true,
    emailNotifications: settings?.emailNotifications ?? true,
    smsNotifications: settings?.smsNotifications ?? false,
    appointmentReminders: settings?.appointmentReminders ?? true,
    queueUpdates: settings?.queueUpdates ?? true,
    documentStatus: settings?.documentStatus ?? true,
    generalAnnouncements: settings?.generalAnnouncements ?? true,
    marketingUpdates: settings?.marketingUpdates ?? false,
    soundEnabled: settings?.soundEnabled ?? true,
    vibrationEnabled: settings?.vibrationEnabled ?? true,
    reminderTime: settings?.reminderTime ?? '30', // minutes before appointment
  });

  const handleToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateNotificationSettings(notificationSettings)).unwrap();
      Alert.alert(t('success'), t('notificationSettingsUpdated'));
    } catch (error) {
      Alert.alert(t('error'), error.message || t('updateSettingsError'));
    }
  };

  const renderToggleItem = (key, title, description) => (
    <View key={key} style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={notificationSettings[key]}
        onValueChange={() => handleToggle(key)}
        trackColor={{ false: colors.border, true: colors.primary + '40' }}
        thumbColor={notificationSettings[key] ? colors.primary : colors.textSecondary}
      />
    </View>
  );

  const reminderOptions = [
    { value: '15', label: '15 minutes before' },
    { value: '30', label: '30 minutes before' },
    { value: '60', label: '1 hour before' },
    { value: '1440', label: '1 day before' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notificationSettings')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          <Text style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}>
            {t('save')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* General Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notificationTypes')}</Text>
          
          {renderToggleItem(
            'pushNotifications',
            t('pushNotifications'),
            t('receiveNotificationsOnDevice')
          )}
          
          {renderToggleItem(
            'emailNotifications',
            t('emailNotifications'),
            t('receiveNotificationsByEmail')
          )}
          
          {renderToggleItem(
            'smsNotifications',
            t('smsNotifications'),
            t('receiveNotificationsBySMS')
          )}
        </View>

        {/* Content Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notificationCategories')}</Text>
          
          {renderToggleItem(
            'appointmentReminders',
            t('appointmentReminders'),
            t('remindersForUpcomingAppointments')
          )}
          
          {renderToggleItem(
            'queueUpdates',
            t('queueUpdates'),
            t('realTimeQueueStatusUpdates')
          )}
          
          {renderToggleItem(
            'documentStatus',
            t('documentStatus'),
            t('updatesOnDocumentProcessing')
          )}
          
          {renderToggleItem(
            'generalAnnouncements',
            t('generalAnnouncements'),
            t('importantSystemAnnouncements')
          )}
          
          {renderToggleItem(
            'marketingUpdates',
            t('marketingUpdates'),
            t('promotionalOffersAndUpdates')
          )}
        </View>

        {/* Sound & Vibration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('soundVibration')}</Text>
          
          {renderToggleItem(
            'soundEnabled',
            t('notificationSound'),
            t('playNotificationSounds')
          )}
          
          {renderToggleItem(
            'vibrationEnabled',
            t('vibration'),
            t('vibrateForNotifications')
          )}
        </View>

        {/* Reminder Timing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('appointmentReminders')}</Text>
          <Text style={styles.sectionDescription}>
            {t('chooseWhenToReceiveReminders')}
          </Text>
          
          {reminderOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.reminderOption}
              onPress={() => setNotificationSettings(prev => ({
                ...prev,
                reminderTime: option.value
              }))}
            >
              <Text style={styles.reminderOptionText}>{option.label}</Text>
              <View style={styles.radioButton}>
                {notificationSettings.reminderTime === option.value && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quietHours')}</Text>
          <Text style={styles.sectionDescription}>
            {t('disableNotificationsDuringHours')}
          </Text>
          
          <TouchableOpacity style={styles.quietHoursButton}>
            <Text style={styles.quietHoursText}>
              {t('setQuietHours')} (22:00 - 08:00)
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Test Notification */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.testButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
            <Text style={styles.testButtonText}>{t('sendTestNotification')}</Text>
          </TouchableOpacity>
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
  saveButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
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
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  reminderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reminderOptionText: {
    ...typography.body,
    color: colors.text,
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
  quietHoursButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quietHoursText: {
    ...typography.body,
    color: colors.text,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.md,
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.md,
  },
  testButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
});

export default NotificationSettingsScreen;
