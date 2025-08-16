import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AccountSecurity() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Button title="Change Password" onPress={() => navigation.navigate('ChangePassword')} />
      <Button title="Two-Factor Authentication" onPress={() => navigation.navigate('TwoFactorSetup')} />
      <Button title="Active Sessions" onPress={() => navigation.navigate('ActiveSessions')} />
      <Button title="Deactivate Account" onPress={() => navigation.navigate('DeactivateAccount')} />
      <Button title="Export My Data" onPress={() => navigation.navigate('ExportData')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
});
