// src/components/queue/QueueStatsCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QueueStats } from '../../types/queue.types';
import { colors, spacing, typography } from '../../constants/theme';

interface QueueStatsCardProps {
  stats: QueueStats;
}

const QueueStatsCard = ({ stats }: QueueStatsCardProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Queue Statistics</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalServed}</Text>
          <Text style={styles.statLabel}>Total Served</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.averageServiceTime} min</Text>
          <Text style={styles.statLabel}>Avg. Service Time</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalInQueue}</Text>
          <Text style={styles.statLabel}>In Queue</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.currentlyServing}</Text>
          <Text style={styles.statLabel}>Currently Serving</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight as any,
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default QueueStatsCard;
