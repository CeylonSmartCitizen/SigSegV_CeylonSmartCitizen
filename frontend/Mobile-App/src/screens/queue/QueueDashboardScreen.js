import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { fetchQueueStatus, joinQueue, leaveQueue } from '../../store/slices/queueSlice';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const QueueDashboardScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    isInQueue,
    queuePosition,
    estimatedWaitTime,
    peopleAhead,
    status,
    isLoading
  } = useSelector((state) => state.queue);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadQueueStatus();
  }, []);

  const loadQueueStatus = async () => {
    try {
      await dispatch(fetchQueueStatus()).unwrap();
    } catch (error) {
      console.error('Error loading queue status:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQueueStatus();
    setRefreshing(false);
  };

  const handleJoinQueue = () => {
    Alert.alert(
      'Join Queue',
      'Do you want to join the queue for your next appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: async () => {
            try {
              await dispatch(joinQueue('appointment-123')).unwrap();
              Alert.alert('Success', 'You have joined the queue!');
            } catch (error) {
              Alert.alert('Error', error);
            }
          }
        }
      ]
    );
  };

  const handleLeaveQueue = () => {
    Alert.alert(
      'Leave Queue',
      'Are you sure you want to leave the queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(leaveQueue()).unwrap();
              Alert.alert('Success', 'You have left the queue.');
            } catch (error) {
              Alert.alert('Error', error);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return colors.warning;
      case 'called':
        return colors.success;
      case 'in_progress':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting':
        return 'Waiting in Queue';
      case 'called':
        return 'Your Turn - Please Proceed';
      case 'in_progress':
        return 'Service in Progress';
      default:
        return 'Not in Queue';
    }
  };

  const formatWaitTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isInQueue ? (
          <>
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status) }]} />
                <Text style={styles.statusText}>{getStatusText(status)}</Text>
              </View>
              
              {status === 'called' && (
                <View style={styles.alertContainer}>
                  <Ionicons name="megaphone" size={24} color={colors.success} />
                  <Text style={styles.alertText}>
                    Please proceed to Counter 3 for your service!
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.queueInfoCard}>
              <Text style={styles.queueInfoTitle}>Queue Information</Text>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="location" size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.infoLabel}>Position</Text>
                  <Text style={styles.infoValue}>{queuePosition || '-'}</Text>
                </View>

                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="people" size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.infoLabel}>People Ahead</Text>
                  <Text style={styles.infoValue}>{peopleAhead || 0}</Text>
                </View>

                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="time" size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.infoLabel}>Est. Wait Time</Text>
                  <Text style={styles.infoValue}>
                    {estimatedWaitTime ? formatWaitTime(estimatedWaitTime) : '-'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actionCard}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => navigation.navigate('DocumentUpload')}
              >
                <Ionicons name="document-text" size={20} color={colors.primary} />
                <Text style={styles.uploadButtonText}>Upload Documents</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.leaveButton}
                onPress={handleLeaveQueue}
              >
                <Text style={styles.leaveButtonText}>Leave Queue</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="time-outline" size={80} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyStateTitle}>Not in Queue</Text>
            <Text style={styles.emptyStateSubtitle}>
              You are not currently in any queue. Join a queue when you arrive for your appointment.
            </Text>
            
            <TouchableOpacity
              style={styles.joinButton}
              onPress={handleJoinQueue}
            >
              <Text style={styles.joinButtonText}>Join Queue</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.quickActionsCard}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('ServicesTab')}
          >
            <Ionicons name="add-circle" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Book New Appointment</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('NotificationsTab')}
          >
            <Ionicons name="notifications" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>View Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('DocumentUpload')}
          >
            <Ionicons name="camera" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Upload Documents</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.h3,
    color: colors.text,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  alertText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
    fontWeight: '600',
  },
  queueInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  queueInfoTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  infoValue: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightBlue,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  uploadButtonText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  leaveButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  leaveButtonText: {
    ...typography.button,
    color: colors.surface,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateIcon: {
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyStateSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  joinButtonText: {
    ...typography.button,
    color: colors.surface,
  },
  quickActionsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  quickActionsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickActionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.md,
  },
});

export default QueueDashboardScreen;
