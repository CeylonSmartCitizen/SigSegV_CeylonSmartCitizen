import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function RegistrationStep1({ form, setForm, nextStep }) {
  const [error, setError] = useState('');

  // Simple NIC format validation (adjust as needed for your country)
  const validateNIC = (nic) => {
    // Example: Sri Lankan NIC (old: 9 digits + V/X, new: 12 digits)
    return (
      (/^\\d{9}[vVxX]$/.test(nic) || /^\\d{12}$/.test(nic))
    );
  };

  const handleChange = (nic) => {
    setForm({ ...form, nic });
    if (nic.length === 10 || nic.length === 12) {
      setError(validateNIC(nic) ? '' : 'Invalid NIC format');
    } else {
      setError('');
    }
  };

  return (
    <View>
      <Text>NIC Number</Text>
      <TextInput
        value={form.nic}
        onChangeText={handleChange}
        placeholder="Enter NIC"
        autoCapitalize="characters"
        keyboardType="default"
      />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <Button title="Next" onPress={nextStep} disabled={!!error || !form.nic} />
    </View>
  );
}