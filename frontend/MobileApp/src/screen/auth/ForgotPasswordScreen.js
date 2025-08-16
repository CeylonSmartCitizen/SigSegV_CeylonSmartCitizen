import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { forgotPassword } from '../../utility/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    try {
      await forgotPassword(email);
      setMessage('Verification email sent. Check your inbox.');
      // Optionally navigate to ResetPasswordScreen
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send email');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      {message ? <Text style={{ color: 'green' }}>{message}</Text> : null}
      <Button title="Send Verification" onPress={handleSubmit} />
    </View>
  );
}