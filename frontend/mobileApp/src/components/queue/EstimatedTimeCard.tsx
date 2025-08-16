// src/components/queue/EstimatedTimeCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants/theme';

interface EstimatedTimeCardProps {
  waitTime: number;
  lastUpdated?: Date;
}

const EstimatedTimeCard = ({ waitTime, lastUpdated }: EstimatedTimeCardProps) => {
  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={24} color={colors.primary} />
        <Text style={styles.title}>Estimated Wait Time</Text>
      </View>
      
      <Text style={styles.waitTime}>{formatWaitTime(waitTime)}</Text>
      
      {lastUpdated && (
        <Text style={styles.lastUpdated}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Text>
      )}
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          This is an estimate based on current queue status and average service time
        </Text>
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
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight as any,
    marginLeft: spacing.sm,
    color: colors.textPrimary,
  },
  waitTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  lastUpdated: {
    fontSize: typography.caption.fontSize,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  infoContainer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    width: '100%',
  },
  infoText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default EstimatedTimeCard;
