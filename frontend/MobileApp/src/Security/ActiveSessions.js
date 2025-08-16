import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
// import { getActiveSessions, logoutSession, logoutAllSessions } from '../../utility/api'; // Uncomment when backend endpoints are ready

export default function ActiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // Uncomment and use when backend endpoint is available
    // (async () => {
    //   try {
    //     const res = await getActiveSessions();
    //     setSessions(res.data);
    //   } catch (e) {
    //     setError('Failed to load sessions.');
    //   } finally {
    //     setLoading(false);
    //   }
    // })();
    setLoading(false); // Remove this line when enabling backend call
  }, []);

  // const handleLogoutSession = async (sessionId) => {
  //   setLoggingOut(true);
  //   try {
  //     await logoutSession(sessionId);
  //     setSessions(sessions.filter(s => s.id !== sessionId));
  //   } catch (e) {
  //     Alert.alert('Error', 'Failed to log out from session.');
  //   }
  //   setLoggingOut(false);
  // };

  // const handleLogoutAll = async () => {
  //   setLoggingOut(true);
  //   try {
  //     await logoutAllSessions();
  //     setSessions([]);
  //   } catch (e) {
  //     Alert.alert('Error', 'Failed to log out from all sessions.');
  //   }
  //   setLoggingOut(false);
  // };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ color: 'red', margin: 20 }}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Sessions</Text>
      {/*
      <FlatList
        data={sessions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.sessionItem}>
            <Text>{item.device} - {item.location} - {item.lastActive}</Text>
            <Button title="Logout" onPress={() => handleLogoutSession(item.id)} disabled={loggingOut} />
          </View>
        )}
        ListEmptyComponent={<Text>No active sessions found.</Text>}
      />
      <Button title="Logout from All Devices" onPress={handleLogoutAll} disabled={loggingOut} />
      */}
      <Text>Active session management is not available yet. Please update the app when this feature is released.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  sessionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
});
