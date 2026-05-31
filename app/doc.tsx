import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SCORE_CATEGORIES } from '../src/game-logic';

const RULES = [
  'Each turn starts with up to five dice in play.',
  'Tap Roll Dice to roll all unheld dice. Tap any die after a roll to hold it for the next roll.',
  'You may roll up to the selected number of times for the turn.',
  'Tap Done when you want to lock the roll into an open score entry.',
  'After scoring, the next player starts a fresh turn with all five dice available.',
  'When every score entry is filled for every player, the highest total wins.',
];

export default function DocScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>How to Play</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rules</Text>
          {RULES.map((rule, index) => (
            <Text key={rule} style={styles.bodyText}>
              {index + 1}. {rule}
            </Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Scoring</Text>
          {['Upper', 'Lower'].map((section) => (
            <View key={section} style={styles.group}>
              <Text style={styles.groupTitle}>{section} section</Text>
              {SCORE_CATEGORIES.filter((category) => category.section === section).map((category) => (
                <View key={category.id} style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>{category.label}</Text>
                  <Text style={styles.scoreDescription}>{category.description}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  bodyText: {
    color: '#374151',
    lineHeight: 22,
  },
  group: {
    gap: 10,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b57d0',
  },
  scoreRow: {
    gap: 4,
  },
  scoreLabel: {
    fontWeight: '700',
    color: '#111827',
  },
  scoreDescription: {
    color: '#374151',
    lineHeight: 20,
  },
});
