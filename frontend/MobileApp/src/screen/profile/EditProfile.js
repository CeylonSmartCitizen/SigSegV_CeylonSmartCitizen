import React, { useState } from 'react';
import { View, TextInput, Button, Image, TouchableOpacity, StyleSheet, Text, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from '../../utility/api';

export default function EditProfile({ route, navigation }) {
  const [form, setForm] = useState(route.params.profile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.cancelled) setForm({ ...form, pictureUrl: result.uri });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    // Required field validation
    if (!form.firstName || !form.lastName || !form.address) {
      setError('First name, last name, and address are required.');
      return;
    }
    setLoading(true);
    try {
      await updateProfile(form);
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigation.goBack(), 1000);
    } catch (e) {
      setError('Failed to update profile.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        <Image source={{ uri: form.pictureUrl || undefined }} style={styles.avatar} />
        <Text style={styles.avatarText}>Change Profile Picture</Text>
      </TouchableOpacity>
      <TextInput
        value={form.firstName}
        onChangeText={firstName => setForm({ ...form, firstName })}
        placeholder="First Name"
        style={styles.input}
      />
      <TextInput
        value={form.lastName}
        onChangeText={lastName => setForm({ ...form, lastName })}
        placeholder="Last Name"
        style={styles.input}
      />
      <TextInput
        value={form.address}
        onChangeText={address => setForm({ ...form, address })}
        placeholder="Address"
        style={styles.input}
      />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      {success ? <Text style={{ color: 'green' }}>{success}</Text> : null}
      {loading ? <ActivityIndicator /> : <Button title="Save" onPress={handleSave} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee' },
  avatarText: { color: '#007AFF', marginTop: 8 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
});
