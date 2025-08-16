import React, { useState, useEffect } from 'react';
import { View, Switch, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { getPreferences, updatePreferences } from '../../utility/api';

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getPreferences();
        setPrefs(res.data);
      } catch (e) {
        setMessage('Failed to load preferences.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await updatePreferences(prefs);
      setMessage('Preferences updated!');
    } catch (e) {
      setMessage('Failed to update preferences.');
    }
    setSaving(false);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!prefs) return <Text>No preferences found.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Receive Email Notifications</Text>
      <Switch
        value={!!prefs.emailNotifications}
        onValueChange={v => setPrefs({ ...prefs, emailNotifications: v })}
      />
      <Text style={styles.label}>Receive SMS Notifications</Text>
      <Switch
        value={!!prefs.smsNotifications}
        onValueChange={v => setPrefs({ ...prefs, smsNotifications: v })}
      />
      {message ? <Text style={{ color: message.includes('Failed') ? 'red' : 'green' }}>{message}</Text> : null}
      <Button title={saving ? 'Saving...' : 'Save Preferences'} onPress={handleSave} disabled={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  label: { marginTop: 20, marginBottom: 5, fontSize: 16 },
});