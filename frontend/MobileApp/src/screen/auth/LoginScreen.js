import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, Switch } from 'react-native';
import * as SecureStore from 'expo-secure-store'; // or use @react-native-async-storage/async-storage
import { loginUser } from '../../utility/api';
import SocialLoginButton from '../../components/common/SocialLoginButton';

export default function LoginScreen({ navigation }) {
  const [form, setForm] = useState({ identifier: '', password: '', remember: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(form.identifier, form.password);
      if (form.remember) {
        await SecureStore.setItemAsync('userToken', res.data.token);
      }
      // Navigate to main app
      navigation.replace('Main');
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <View>
      <TextInput
        placeholder="Email or Phone"
        value={form.identifier}
        onChangeText={identifier => setForm({ ...form, identifier })}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={form.password}
        onChangeText={password => setForm({ ...form, password })}
        secureTextEntry
      />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Switch
          value={form.remember}
          onValueChange={remember => setForm({ ...form, remember })}
        />
        <Text>Remember me</Text>
      </View>
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} />
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={{ color: '#007AFF', marginTop: 10 }}>Forgot Password?</Text>
      </TouchableOpacity>
      <SocialLoginButton provider="google" />
      <SocialLoginButton provider="facebook" />
      <TouchableOpacity onPress={() => navigation.navigate('BiometricSetup')}>
        <Text style={{ color: '#007AFF', marginTop: 10 }}>Set up Biometric Login</Text>
      </TouchableOpacity>
    </View>
  );
}