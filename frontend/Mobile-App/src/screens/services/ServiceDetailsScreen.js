import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const ServiceDetailsScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { service } = route.params;

  const requiredDocuments = [
    'National Identity Card (NIC)',
    'Passport Size Photographs (2)',
    'Address Proof',
    'Income Certificate',
  ];

  const processSteps = [
    'Submit application with required documents',
    'Document verification',
    'Fee payment',
    'Processing and approval',
    'Collection of certificate/document',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.serviceIcon}>
            <Ionicons name="briefcase" size={40} color={colors.primary} />
          </View>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceCategory}>{service.category}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Fee:</Text>
            <Text style={styles.infoValue}>LKR {service.fee}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Duration:</Text>
            <Text style={styles.infoValue}>{service.duration} minutes</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="business" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Department:</Text>
            <Text style={styles.infoValue}>{service.department || 'General Services'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {service.description || 'This service provides essential documentation and certification for citizens. Our experienced staff will guide you through the process to ensure a smooth experience.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          {requiredDocuments.map((doc, index) => (
            <View key={index} style={styles.documentItem}>
              <Ionicons name="document-text" size={16} color={colors.primary} />
              <Text style={styles.documentText}>{doc}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Process Steps</Text>
          {processSteps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Officer Information</Text>
          <View style={styles.officerCard}>
            <View style={styles.officerAvatar}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View style={styles.officerInfo}>
              <Text style={styles.officerName}>Mr. K.A. Silva</Text>
              <Text style={styles.officerTitle}>Senior Officer</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={16}
                    color={star <= 4 ? colors.warning : colors.border}
                  />
                ))}
                <Text style={styles.ratingText}>4.0 (25 reviews)</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('Booking', { service })}
        >
          <Text style={styles.bookButtonText}>{t('bookAppointment')}</Text>
        </TouchableOpacity>
      </View>
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
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.lg,
  },
  serviceIcon: {
    width: 80,
    height: 80,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  serviceName: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  serviceCategory: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  infoValue: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  documentText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  stepNumberText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: 'bold',
  },
  stepText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  officerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  officerAvatar: {
    width: 50,
    height: 50,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  officerInfo: {
    flex: 1,
  },
  officerName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  officerTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  bookButtonText: {
    ...typography.button,
    color: colors.surface,
  },
});

export default ServiceDetailsScreen;
