// src/screens/queue/QueueDashboardScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import QueuePositionCard from './QueuePositionCard';
import QueueProgressBar from '../../components/queue/QueueProgressBar';
import EstimatedTimeCard from '../../components/queue/EstimatedTimeCard';
import QueueStatsCard from '../../components/queue/QueueStatsCard';
import { QueueData } from '../../types/queue.types';
import { mockQueueService } from '../../services/mockQueueService';
import { colors, spacing, typography } from '../../constants/theme';

const QueueDashboardScreen: React.FC = () => {
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadQueueData = async () => {
    try {
      setError(null);
      const data = await mockQueueService.getCurrentQueueStatus();
      setQueueData(data);
    } catch (err) {
      setError('Failed to load queue data');
      Alert.alert('Error', 'Failed to load queue information');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadQueueData();
    setRefreshing(false);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    loadQueueData();
    
    const interval = setInterval(async () => {
      try {
        const updatedData = await mockQueueService.getCurrentQueueStatus();
        setQueueData(updatedData);
      } catch (err) {
        console.error('Failed to update queue data:', err);
      }
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Focus effect to refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadQueueData();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading queue information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !queueData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Queue Status</Text>
          {queueData?.tokenNumber && (
            <Text style={styles.tokenText}>Token: {queueData.tokenNumber}</Text>
          )}
        </View>

        {queueData && (
          <>
            <QueuePositionCard
              currentPosition={queueData.currentPosition}
              peopleAhead={queueData.peopleAhead}
              status={queueData.status}
            />

            <EstimatedTimeCard
              waitTime={queueData.estimatedWaitTime}
              lastUpdated={queueData.lastUpdated}
            />

            <QueueProgressBar
              current={queueData.currentPosition}
              total={queueData.queueStats.totalInQueue}
              served={queueData.queueStats.totalServed}
            />

            <QueueStatsCard stats={queueData.queueStats} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.body.fontSize,
    color: colors.error,
    textAlign: 'center',
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight as any,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  tokenText: {
    fontSize: typography.body.fontSize,
    color: colors.white,
    opacity: 0.9,
  },
});

export default QueueDashboardScreen;
