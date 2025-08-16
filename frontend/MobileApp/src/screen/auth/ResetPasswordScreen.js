import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { resetPassword } from '../../utility/api';

export default function ResetPasswordScreen({ route, navigation }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { token } = route.params; // token from email link

  const handleReset = async () => {
    setError('');
    setMessage('');
    try {
      await resetPassword(token, password);
      setMessage('Password reset successful!');
      navigation.navigate('Login');
    } catch (e) {
      setError(e.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      {message ? <Text style={{ color: 'green' }}>{message}</Text> : null}
      <Button title="Reset Password" onPress={handleReset} />
    </View>
  );
}