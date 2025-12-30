import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAppNavigation } from '../navigation/NavigationContext';

const Result: React.FC<{ routeParams?: any }> = ({ routeParams }) => {
  const { goBack } = useAppNavigation();
  const { service, estimate, message } = routeParams || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended Service</Text>
      <Text style={styles.service}>{service ?? 'General'}</Text>
      <Text style={styles.estimate}>Estimated cost: ₹{estimate ?? '—'}</Text>
      {message ? <Text style={styles.message}>You said: {message}</Text> : null}
      <Button title="Back" onPress={goBack} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  service: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  estimate: { fontSize: 16, color: '#333', marginBottom: 12 },
  message: { fontSize: 14, color: '#666', marginBottom: 20 },
});

export default Result;
