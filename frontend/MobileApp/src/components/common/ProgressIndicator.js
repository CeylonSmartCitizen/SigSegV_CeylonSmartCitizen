import React from 'react';
import { View, Text } from 'react-native';

export default function ProgressIndicator({ step, total }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', margin: 10 }}>
      {[...Array(total)].map((_, i) => (
        <Text key={i} style={{ margin: 2, color: i + 1 === step ? '#007AFF' : '#aaa' }}>
          ●
        </Text>
      ))}
    </View>
  );
}