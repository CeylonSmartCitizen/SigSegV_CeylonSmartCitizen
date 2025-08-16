import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const BookingConfirmationScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { appointment } = route.params;

  const handleDone = () => {
    navigation.navigate('ServicesTab', { screen: 'ServicesList' });
  };

  const handleViewAppointments = () => {
    navigation.navigate('QueueTab', { screen: 'QueueDashboard' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </View>
          
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your appointment has been successfully booked.
          </Text>
        </View>

        <View style={styles.appointmentDetails}>
          <Text style={styles.detailsTitle}>Appointment Details</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="briefcase" size={20} color={colors.primary} />
            <Text style={styles.detailLabel}>Service:</Text>
            <Text style={styles.detailValue}>{appointment.service}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(appointment.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{appointment.time}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>Government Service Center</Text>
          </View>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Important Instructions</Text>
          
          <View style={styles.instruction}>
            <Ionicons name="document-text" size={16} color={colors.primary} />
            <Text style={styles.instructionText}>
              Bring all required documents (originals and copies)
            </Text>
          </View>

          <View style={styles.instruction}>
            <Ionicons name="time" size={16} color={colors.primary} />
            <Text style={styles.instructionText}>
              Arrive 15 minutes before your appointment time
            </Text>
          </View>

          <View style={styles.instruction}>
            <Ionicons name="card" size={16} color={colors.primary} />
            <Text style={styles.instructionText}>
              Bring a valid ID for verification
            </Text>
          </View>

          <View style={styles.instruction}>
            <Ionicons name="call" size={16} color={colors.primary} />
            <Text style={styles.instructionText}>
              Contact us if you need to reschedule: (011) 123-4567
            </Text>
          </View>
        </View>

        <View style={styles.reminderContainer}>
          <View style={styles.reminderIcon}>
            <Ionicons name="notifications" size={24} color={colors.warning} />
          </View>
          <Text style={styles.reminderText}>
            You will receive a reminder notification 1 hour before your appointment.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleViewAppointments}
          >
            <Text style={styles.primaryButtonText}>View My Appointments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleDone}
          >
            <Text style={styles.secondaryButtonText}>Done</Text>
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
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  appointmentDetails: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  detailsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
    minWidth: 60,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    marginLeft: spacing.sm,
  },
  instructionsContainer: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  instructionsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  instructionText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  reminderIcon: {
    marginRight: spacing.md,
  },
  reminderText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.surface,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
  },
});

export default BookingConfirmationScreen;
