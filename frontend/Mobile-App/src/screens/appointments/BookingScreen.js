import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

import { createAppointment, setSelectedDate, setSelectedTime, updateBookingData } from '../../store/slices/appointmentsSlice';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const BookingScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { service } = route.params;
  const { selectedDate, selectedTime, isCreating } = useSelector((state) => state.appointments);

  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Sample time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30'
  ];

  const handleDateSelect = (day) => {
    dispatch(setSelectedDate(day.dateString));
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedSlot(time);
    dispatch(setSelectedTime(time));
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }

    try {
      await dispatch(createAppointment({
        serviceId: service.id,
        date: selectedDate,
        time: selectedSlot,
        notes: '',
      })).unwrap();

      navigation.navigate('BookingConfirmation', {
        appointment: {
          service: service.name,
          date: selectedDate,
          time: selectedSlot,
        }
      });
    } catch (error) {
      Alert.alert('Booking Failed', error);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Date</Text>
      <Calendar
        onDayPress={handleDateSelect}
        minDate={new Date().toISOString().split('T')[0]}
        maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.surface,
          textSectionTitleColor: colors.text,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.surface,
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.textSecondary,
          dotColor: colors.primary,
          selectedDotColor: colors.surface,
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          indicatorColor: colors.primary,
        }}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.stepTitle}>Select Time</Text>
      </View>
      
      <Text style={styles.selectedDate}>
        Selected Date: {new Date(selectedDate).toLocaleDateString()}
      </Text>

      <View style={styles.timeSlotsContainer}>
        {timeSlots.map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeSlot,
              selectedSlot === time && styles.selectedTimeSlot
            ]}
            onPress={() => handleTimeSelect(time)}
          >
            <Text style={[
              styles.timeSlotText,
              selectedSlot === time && styles.selectedTimeSlotText
            ]}>
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedSlot && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleBooking}
          disabled={isCreating}
        >
          <Text style={styles.confirmButtonText}>
            {isCreating ? 'Booking...' : 'Confirm Booking'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceFee}>Fee: LKR {service.fee}</Text>
          <Text style={styles.serviceDuration}>Duration: {service.duration} minutes</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressStep,
              step >= 1 && styles.progressStepActive
            ]}>
              <Text style={[
                styles.progressStepText,
                step >= 1 && styles.progressStepTextActive
              ]}>1</Text>
            </View>
            <View style={[
              styles.progressLine,
              step >= 2 && styles.progressLineActive
            ]} />
            <View style={[
              styles.progressStep,
              step >= 2 && styles.progressStepActive
            ]}>
              <Text style={[
                styles.progressStepText,
                step >= 2 && styles.progressStepTextActive
              ]}>2</Text>
            </View>
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Date</Text>
            <Text style={styles.progressLabel}>Time</Text>
          </View>
        </View>

        {step === 1 ? renderStep1() : renderStep2()}
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
  },
  serviceInfo: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  serviceName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  serviceFee: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  serviceDuration: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginVertical: spacing.lg,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: colors.primary,
  },
  progressStepText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  progressStepTextActive: {
    color: colors.surface,
  },
  progressLine: {
    width: 50,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stepContainer: {
    marginBottom: spacing.xl,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
  },
  stepTitle: {
    ...typography.h2,
    color: colors.text,
  },
  selectedDate: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  timeSlot: {
    width: '30%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  selectedTimeSlot: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeSlotText: {
    ...typography.body,
    color: colors.text,
  },
  selectedTimeSlotText: {
    color: colors.surface,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  confirmButtonText: {
    ...typography.button,
    color: colors.surface,
  },
});

export default BookingScreen;
