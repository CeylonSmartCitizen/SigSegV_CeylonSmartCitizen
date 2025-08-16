import React from 'react';
import { Button } from 'react-native';

export default function SocialLoginButton({ provider }) {
  const handlePress = () => {
    // Implement Google/Facebook login logic here
    alert(`Login with ${provider} coming soon!`);
  };

  return (
    <Button
      title={`Continue with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
      onPress={handlePress}
      color={provider === 'google' ? '#DB4437' : '#4267B2'}
    />
  );
}