import React, { useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import { setupTwoFactor, verifyTwoFactor, disableTwoFactor } from '../../utility/api'; // Uncomment when backend is ready

export default function TwoFactorSetup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEnable2FA = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Uncomment and implement when backend is ready
       const res = await setupTwoFactor();
      setMessage('2FA setup instructions sent to your email or shown as QR code.');
      Alert.alert(
        'Two-Factor Authentication',
        'This feature is not available yet. Please contact support to enable 2FA.'
      );
    } catch (e) {
      setMessage('Failed to enable 2FA.');
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Text style={{ marginBottom: 20 }}>
        Enable two-factor authentication (2FA) for extra account security.
      </Text>
      {message ? <Text style={{ color: message.includes('Failed') ? 'red' : 'green' }}>{message}</Text> : null}
      {loading ? <ActivityIndicator /> : (
        <Button
          title="Enable 2FA"
          onPress={handleEnable2FA}
          color="#007AFF"
        />
      )}
    </View>
  );
}