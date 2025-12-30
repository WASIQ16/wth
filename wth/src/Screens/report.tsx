import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useAppNavigation } from '../navigation/NavigationContext';

const Report: React.FC = () => {
  const { navigate } = useAppNavigation();
  const [text, setText] = useState('');

  const submit = () => {
    // simple heuristic to pick a service based on keywords
    const t = text.toLowerCase();
    let service = 'General';
    let estimate = 50;
    if (t.includes('paint') || t.includes('painting')) {
      service = 'Paint work';
      estimate = 120;
    } else if (t.includes('plumb') || t.includes('leak')) {
      service = 'Plumbing';
      estimate = 90;
    } else if (t.includes('elect') || t.includes('wire') || t.includes('socket')) {
      service = 'Electrical';
      estimate = 110;
    } else if (t.includes('ac') || t.includes('air') || t.includes('cool')) {
      service = 'AC';
      estimate = 150;
    }

    // navigate to result with simulated estimate
    navigate('Result', { service, estimate, message: text });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Describe your issue</Text>
      <View style={styles.inputcontainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your complaint or paste a voice transcription"
          value={text}
          onChangeText={setText}
          multiline
        />
      </View>
      <View style={styles.row}>
        <Button title="Record voice (stub)" onPress={() => { }} />
        <Button title="Submit" onPress={submit} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', paddingTop: 20, marginBottom: 12, textAlign: 'center' },
  input: { height: 120, width: '90%', borderColor: '#ccc', borderWidth: 0.8, padding: 8, borderRadius: 6, marginBottom: 12 },
  inputcontainer: { marginVertical: 20, alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});

export default Report;
