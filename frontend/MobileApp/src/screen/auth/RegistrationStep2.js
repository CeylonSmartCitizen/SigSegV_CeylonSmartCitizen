import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function RegistrationStep2({ form, setForm, nextStep, prevStep }) {
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');

  const validate = () => {
    let errs = {};
    if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!/^\\d{10}$/.test(form.phone)) errs.phone = 'Invalid phone (10 digits)';
    if (form.password.length < 8) errs.password = 'Password too short';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordChange = (password) => {
    setForm({ ...form, password });
    // Simple strength check (add more rules as needed)
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      setPasswordStrength('Strong');
    } else if (password.length >= 8) {
      setPasswordStrength('Medium');
    } else {
      setPasswordStrength('Weak');
    }
  };

  return (
    <View>
      <Text>Email</Text>
      <TextInput
        value={form.email}
        onChangeText={email => setForm({ ...form, email })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={{ color: 'red' }}>{errors.email}</Text>}

      <Text>Phone</Text>
      <TextInput
        value={form.phone}
        onChangeText={phone => setForm({ ...form, phone })}
        keyboardType="phone-pad"
      />
      {errors.phone && <Text style={{ color: 'red' }}>{errors.phone}</Text>}

      <Text>Password</Text>
      <TextInput
        value={form.password}
        onChangeText={handlePasswordChange}
        secureTextEntry
      />
      <Text>Password strength: {passwordStrength}</Text>
      {errors.password && <Text style={{ color: 'red' }}>{errors.password}</Text>}

      <Button title="Back" onPress={prevStep} />
      <Button title="Next" onPress={() => validate() && nextStep()} />
    </View>
  );
}