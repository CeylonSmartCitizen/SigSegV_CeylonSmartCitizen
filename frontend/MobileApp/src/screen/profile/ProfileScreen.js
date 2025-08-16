import React, { useEffect, useState } from 'react';
import { View, Text, Button, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { getProfile } from '../../utility/api';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
      } catch (e) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ color: 'red', margin: 20 }}>{error}</Text>;
  if (!profile) return <Text>No profile data found.</Text>;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('EditProfile', { profile })}>
        <Image source={{ uri: profile.pictureUrl || undefined }} style={styles.avatar} />
        <Text style={styles.name}>{profile.firstName} {profile.lastName}</Text>
        <Text>{profile.email}</Text>
        <Text>{profile.phoneNumber}</Text>
        <Text>{profile.address}</Text>
      </TouchableOpacity>
      <Button title="Edit Profile" onPress={() => navigation.navigate('EditProfile', { profile })} />
      <Button title="Notification Preferences" onPress={() => navigation.navigate('NotificationPreferences')} />
      <Button title="Account Security" onPress={() => navigation.navigate('AccountSecurity')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, backgroundColor: '#eee' },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
});
