import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SCORE_CATEGORIES } from '../src/game-logic';
import { useThemeColors } from '../src/theme';

const RULES = [
  'Each turn starts with up to five dice in play.',
  'Tap Roll Dice to roll all unheld dice. Tap any die after a roll to hold it for the next roll.',
  'You may roll up to the selected number of times for the turn.',
  'When a roll can be scored, the score sheet shows preview values for each valid open entry.',
  'Tap Use on the row you want to score to post that value and end the turn.',
  'After scoring, the next player starts a fresh turn with all five dice available.',
  'When every score entry is filled for every player, the highest total wins.',
  'Bockzee Bonus: if you roll another five-of-a-kind after scoring 50 in Bockzee, you gain +100 each time, but must score that roll in another category.',
  'Bockzee Joker rule: if the matching upper category is open you must use it; otherwise you may score any open lower category, and the roll counts for Full House, Small Straight, or Large Straight.',
];

export default function DocScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>How to Play</Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rules</Text>
          {RULES.map((rule, index) => (
            <Text key={rule} style={[styles.bodyText, { color: colors.textSecondary }]}>
              {index + 1}. {rule}
            </Text>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Scoring</Text>
          {['Upper', 'Lower'].map((section) => (
            <View key={section} style={styles.group}>
              <Text style={[styles.groupTitle, { color: colors.accent }]}>{section} section</Text>
              {SCORE_CATEGORIES.filter((category) => category.section === section).map((category) => (
                <View key={category.id} style={styles.scoreRow}>
                  <Text style={[styles.scoreLabel, { color: colors.text }]}>{category.label}</Text>
                  <Text style={[styles.scoreDescription, { color: colors.textSecondary }]}>
                    {category.description}
                  </Text>
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
  },
  card: {
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
  },
  bodyText: {
    lineHeight: 22,
  },
  group: {
    gap: 10,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scoreRow: {
    gap: 4,
  },
  scoreLabel: {
    fontWeight: '700',
  },
  scoreDescription: {
    lineHeight: 20,
  },
});
