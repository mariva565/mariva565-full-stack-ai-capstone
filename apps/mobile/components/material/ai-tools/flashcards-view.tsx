import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../lib/app-preferences";
import type { Flashcard } from "../../../lib/studyhub-types";

export function FlashcardsView({ cards }: { cards: Flashcard[] }) {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[currentIndex];
  if (!card) return null;

  function goTo(index: number) {
    setFlipped(false);
    setCurrentIndex(index);
  }

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.header, { color: colors.brandPrimary }]}>
        FLASHCARDS - {currentIndex + 1} OF {cards.length}
      </Text>
      
      <TouchableOpacity 
        style={[
          styles.cardBox, 
          { backgroundColor: flipped ? colors.infoSoft : colors.surface, borderColor: flipped ? colors.link : colors.borderMuted }
        ]} 
        activeOpacity={0.8}
        onPress={() => setFlipped(!flipped)}
      >
        <Text style={[styles.cardTypeLabel, { color: flipped ? colors.link : colors.brandPrimary }]}>
          {flipped ? "ANSWER" : "QUESTION"}
        </Text>
        <Text style={[styles.cardText, { color: colors.textPrimary }]}>
          {flipped ? card.back : card.front}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.hint, { color: colors.textMuted }]}>Tap the card to flip it</Text>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.btn, currentIndex === 0 && styles.btnDisabled, { borderColor: colors.borderMuted }]} 
          disabled={currentIndex === 0} 
          onPress={() => goTo(currentIndex - 1)}
        >
          <Text style={[styles.btnText, { color: currentIndex === 0 ? colors.textMuted : colors.textPrimary }]}>Previous</Text>
        </TouchableOpacity>
        
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {currentIndex + 1} / {cards.length}
        </Text>
        
        <TouchableOpacity 
          style={[styles.btn, currentIndex === cards.length - 1 && styles.btnDisabled, { borderColor: colors.borderMuted }]} 
          disabled={currentIndex === cards.length - 1} 
          onPress={() => goTo(currentIndex + 1)}
        >
          <Text style={[styles.btnText, { color: currentIndex === cards.length - 1 ? colors.textMuted : colors.textPrimary }]}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
  },
  header: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  cardBox: {
    borderRadius: 16,
    borderWidth: 1,
    height: 200,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTypeLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  hint: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  btn: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  count: {
    fontSize: 13,
    fontWeight: "600",
  },
});
