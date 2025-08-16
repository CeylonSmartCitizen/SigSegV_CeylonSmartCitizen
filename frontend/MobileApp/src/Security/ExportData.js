import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import { exportUserData } from '../../utility/api'; // Uncomment when backend endpoint is ready

export default function ExportData() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Uncomment the following lines when backend endpoint is available
       const res = await exportUserData();
      // setMessage('Your data export is ready. Check your email or download link.');
      Alert.alert(
        'Data Export',
        'This feature is not available yet. Please contact support to export your data.'
      );
    } catch (e) {
      setMessage('Failed to export data.');
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Text style={{ marginBottom: 20 }}>
        You can request a copy of your data. We will send it to your email or provide a download link.
      </Text>
      {message ? <Text style={{ color: message.includes('Failed') ? 'red' : 'green' }}>{message}</Text> : null}
      {loading ? <ActivityIndicator /> : (
        <Button
          title="Export My Data"
          onPress={handleExport}
          color="#007AFF"
        />
      )}
    </View>
  );
}
