import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const QueuePositionScreen = () => {
  const { t } = useTranslation();
  const {
    queuePosition,
    estimatedWaitTime,
    peopleAhead,
    status
  } = useSelector((state) => state.queue);

  const formatWaitTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.positionCard}>
          <Text style={styles.positionLabel}>Your Position</Text>
          <Text style={styles.positionNumber}>{queuePosition || '-'}</Text>
          <Text style={styles.positionSubtext}>in the queue</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="people" size={32} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{peopleAhead || 0}</Text>
            <Text style={styles.statLabel}>People Ahead</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="time" size={32} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>
              {estimatedWaitTime ? formatWaitTime(estimatedWaitTime) : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Estimated Wait</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Queue Progress</Text>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: queuePosition ? `${Math.max(10, 100 - (queuePosition * 10))}%` : '10%' }
            ]} />
          </View>
          <Text style={styles.progressText}>
            {queuePosition ? `${Math.max(10, 100 - (queuePosition * 10))}%` : '10%'} Complete
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Current Status</Text>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot,
              { backgroundColor: status === 'waiting' ? colors.warning : colors.border }
            ]} />
            <Text style={styles.statusText}>Waiting in Queue</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot,
              { backgroundColor: status === 'called' ? colors.success : colors.border }
            ]} />
            <Text style={styles.statusText}>Called for Service</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot,
              { backgroundColor: status === 'in_progress' ? colors.primary : colors.border }
            ]} />
            <Text style={styles.statusText}>Service in Progress</Text>
          </View>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips & Information</Text>
          
          <View style={styles.tipItem}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={styles.tipText}>
              Keep your documents ready for quick processing
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Ionicons name="notifications" size={20} color={colors.primary} />
            <Text style={styles.tipText}>
              You'll receive a notification when it's your turn
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={styles.tipText}>
              Estimated wait times may vary based on service complexity
            </Text>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  positionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    marginBottom: spacing.lg,
  },
  positionLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  positionNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  positionSubtext: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: spacing.md,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  progressTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statusTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  statusText: {
    ...typography.body,
    color: colors.text,
  },
  tipsCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  tipsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  tipText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
});

export default QueuePositionScreen;
