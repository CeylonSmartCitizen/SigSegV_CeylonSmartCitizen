import React, { useState } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { changePassword } from '../../utility/api';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await changePassword(oldPassword, newPassword);
      setMessage('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to change password.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Current Password"
        value={oldPassword}
        onChangeText={setOldPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
      />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      {message ? <Text style={{ color: 'green' }}>{message}</Text> : null}
      {loading ? <ActivityIndicator /> : <Button title="Change Password" onPress={handleChange} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
});
