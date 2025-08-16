// src/components/queue/QueuePositionCard.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

interface QueuePositionCardProps {
  currentPosition: number;
  peopleAhead: number;
  status: 'waiting' | 'called' | 'serving' | 'completed' | 'cancelled';
}

const QueuePositionCard = ({
  currentPosition,
  peopleAhead,
  status,
}: QueuePositionCardProps) => {
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate when position changes
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentPosition]);

  useEffect(() => {
    // Pulse animation for "called" status
    if (status === 'called') {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (status === 'called') {
            pulse();
          }
        });
      };
      pulse();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [status]);

  const getStatusColor = () => {
    switch (status) {
      case 'waiting':
        return colors.primary;
      case 'called':
        return colors.warning;
      case 'serving':
        return colors.success;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'waiting':
        return 'Waiting in queue';
      case 'called':
        return 'You have been called!';
      case 'serving':
        return 'Currently being served';
      case 'completed':
        return 'Service completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown status';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Your Position</Text>
        
        <Animated.View
          style={[
            styles.positionContainer,
            {
              transform: [
                { scale: scaleAnimation },
                { scale: pulseAnimation },
              ],
            },
          ]}
        >
          <Text style={[styles.positionNumber, { color: getStatusColor() }]}>
            {currentPosition}
          </Text>
        </Animated.View>

        <Text style={styles.peopleAhead}>
          {peopleAhead === 0 
            ? "You're next!" 
            : `${peopleAhead} ${peopleAhead === 1 ? 'person' : 'people'} ahead`
          }
        </Text>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  positionContainer: {
    marginVertical: spacing.md,
  },
  positionNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    lineHeight: 72,
  },
  peopleAhead: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  statusText: {
    color: colors.white,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
});

export default QueuePositionCard;
