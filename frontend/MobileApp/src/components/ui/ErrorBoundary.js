import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    console.error(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback, errorMessage } = this.props;
    if (hasError) {
      if (fallback) {
        return typeof fallback === 'function' ? fallback({ error, errorInfo, onRetry: this.handleRetry }) : fallback;
      }
      return (
        <View style={styles.container}>
          <Text style={styles.text}>{errorMessage || 'Something went wrong.'}</Text>
          <Button title="Try Again" onPress={this.handleRetry} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  text: { fontSize: 16, marginBottom: 10, textAlign: 'center', color: '#d32f2f' },
});
