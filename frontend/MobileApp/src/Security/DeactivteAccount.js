import React, { useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import { deactivateAccount } from '../../utility/api'; // Uncomment when backend endpoint is ready

export default function DeactivateAccount() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDeactivate = async () => {
    setLoading(true);
    setMessage('');
    try {
      //Uncomment the following lines when backend endpoint is available
      await deactivateAccount();
      setMessage('Your account has been deactivated.');
      // Optionally, log the user out or navigate away
      Alert.alert(
        'Account Deactivation',
        'This feature is not available yet. Please contact support to deactivate your account.'
      );
    } catch (e) {
      setMessage('Failed to deactivate account.');
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Text style={{ marginBottom: 20 }}>
        Deactivating your account will disable your access and remove your data from our system.
      </Text>
      {message ? <Text style={{ color: message.includes('Failed') ? 'red' : 'green' }}>{message}</Text> : null}
      {loading ? <ActivityIndicator /> : (
        <Button
          title="Deactivate Account"
          onPress={handleDeactivate}
          color="#d32f2f"
        />
      )}
    </View>
  );
}
