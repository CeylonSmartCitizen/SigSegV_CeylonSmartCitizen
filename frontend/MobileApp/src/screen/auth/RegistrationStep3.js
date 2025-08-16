import React, { useState } from 'react';
import { View, Text, Button, Switch } from 'react-native';
// Use Picker from @react-native-picker/picker if not using Expo
import { Picker } from '@react-native-picker/picker';
import { registerUser } from '../../utility/api';

export default function RegistrationStep3({ form, setForm, prevStep, navigation }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      await registerUser(form);
      navigation.navigate('Login');
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <View>
      <Text>Language Preference</Text>
      <Picker
        selectedValue={form.language}
        onValueChange={lang => setForm({ ...form, language: lang })}
      >
        <Picker.Item label="English" value="en" />
        <Picker.Item label="සිංහල" value="si" />
        <Picker.Item label="தமிழ்" value="ta" />
      </Picker>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
        <Switch
          value={form.termsAccepted}
          onValueChange={val => setForm({ ...form, termsAccepted: val })}
        />
        <Text style={{ marginLeft: 8 }}>I accept the Terms of Service and Privacy Policy</Text>
      </View>
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <Button title="Back" onPress={prevStep} />
      <Button
        title={loading ? 'Registering...' : 'Register'}
        onPress={handleRegister}
        disabled={!form.termsAccepted || loading}
      />
    </View>
  );
}