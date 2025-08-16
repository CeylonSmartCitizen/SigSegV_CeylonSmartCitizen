import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { markNotificationAsRead } from '../../store/slices/notificationsSlice';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const NotificationDetailsScreen = ({ route, navigation }) => {
  const { notification } = route.params;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification.id));
    }
  }, [notification.id, notification.read, dispatch]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return 'calendar';
      case 'queue':
        return 'time';
      case 'document':
        return 'document-text';
      case 'general':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment':
        return colors.primary;
      case 'queue':
        return colors.warning;
      case 'document':
        return colors.success;
      case 'general':
        return colors.textSecondary;
      default:
        return colors.primary;
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleActionButton = () => {
    // Handle notification action based on type
    switch (notification.type) {
      case 'appointment':
        navigation.navigate('AppointmentDetails', { id: notification.relatedId });
        break;
      case 'queue':
        navigation.navigate('QueueDashboard');
        break;
      case 'document':
        navigation.navigate('DocumentUpload');
        break;
      default:
        navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notificationDetails')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.notificationHeader}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: getNotificationColor(notification.type) + '20' }
          ]}>
            <Ionicons
              name={getNotificationIcon(notification.type)}
              size={32}
              color={getNotificationColor(notification.type)}
            />
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationDate}>
              {formatDateTime(notification.timestamp)}
            </Text>
          </View>
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>Message</Text>
          <Text style={styles.messageContent}>{notification.message}</Text>
        </View>

        {notification.details && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Details</Text>
            <Text style={styles.detailsContent}>{notification.details}</Text>
          </View>
        )}

        {notification.image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: notification.image }} style={styles.notificationImage} />
          </View>
        )}

        {notification.actionText && (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleActionButton}>
              <Text style={styles.actionButtonText}>{notification.actionText}</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.surface} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.metadataContainer}>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Type:</Text>
            <Text style={styles.metadataValue}>
              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
            </Text>
          </View>
          
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Priority:</Text>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: notification.priority === 'high' ? colors.error : 
                               notification.priority === 'medium' ? colors.warning : 
                               colors.success }
            ]}>
              <Text style={styles.priorityText}>
                {notification.priority ? notification.priority.toUpperCase() : 'NORMAL'}
              </Text>
            </View>
          </View>

          {notification.category && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Category:</Text>
              <Text style={styles.metadataValue}>{notification.category}</Text>
            </View>
          )}
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
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  notificationTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  notificationDate: {
    ...typography.body,
    color: colors.textSecondary,
  },
  messageContainer: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  messageTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  messageContent: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  detailsContainer: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailsTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailsContent: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  imageContainer: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    resizeMode: 'cover',
  },
  actionContainer: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  actionButtonText: {
    ...typography.buttonMedium,
    color: colors.surface,
    marginRight: spacing.sm,
  },
  metadataContainer: {
    paddingVertical: spacing.lg,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  metadataLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metadataValue: {
    ...typography.body,
    color: colors.text,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  priorityText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
    fontSize: 10,
  },
});

export default NotificationDetailsScreen;
