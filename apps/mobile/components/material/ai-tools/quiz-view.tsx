import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../lib/app-preferences";
import type { QuizQuestion } from "../../../lib/studyhub-types";

export function QuizView({ questions }: { questions: QuizQuestion[] }) {
  const { colors } = useTheme();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const score = questions.reduce(
    (sum, question, index) => sum + (answers[index] === question.correct ? 1 : 0),
    0,
  );
  const allAnswered = Object.keys(answers).length === questions.length;

  function selectAnswer(questionIndex: number, letter: string) {
    if (showResults) return;
    setAnswers((current) => ({ ...current, [questionIndex]: letter }));
  }

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.header, { color: colors.brandPrimary }]}>
        QUIZ - {questions.length} QUESTIONS
      </Text>

      <View style={styles.list}>
        {questions.map((question, qIdx) => (
          <View key={`${qIdx}-${question.question}`} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderMuted }]}>
            <Text style={[styles.question, { color: colors.textPrimary }]}>
              {qIdx + 1}. {question.question}
            </Text>
            
            <View style={styles.options}>
              {question.options.map((option) => {
                const letter = option.charAt(0);
                const isSelected = answers[qIdx] === letter;
                const isCorrect = letter === question.correct;

                let bgColor = colors.canvas;
                let bdColor = colors.borderMuted;
                let txtColor = colors.textSecondary;

                if (showResults && isCorrect) {
                  bgColor = colors.successSoft;
                  bdColor = colors.successBorder;
                  txtColor = colors.successBorder;
                } else if (showResults && isSelected && !isCorrect) {
                  bgColor = colors.dangerSoft;
                  bdColor = colors.danger;
                  txtColor = colors.danger;
                } else if (isSelected) {
                  bgColor = colors.violetSoft;
                  bdColor = colors.brandPrimary;
                  txtColor = colors.brandDeep;
                }

                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionBtn, { backgroundColor: bgColor, borderColor: bdColor }]}
                    activeOpacity={0.7}
                    onPress={() => selectAnswer(qIdx, letter)}
                  >
                    <Text style={[styles.optionTxt, { color: txtColor }]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {showResults && answers[qIdx] !== question.correct ? (
              <Text style={[styles.explanation, { color: colors.textMuted }]}>
                {question.explanation}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      {showResults ? (
        <View style={[styles.scoreBox, { backgroundColor: score === questions.length ? colors.successSoft : colors.violetSoft }]}>
          <Text style={[styles.scoreTxt, { color: score === questions.length ? colors.successBorder : colors.brandDeep }]}>
            Score: {score} / {questions.length}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.checkBtn, !allAnswered && styles.checkBtnDisabled, { backgroundColor: colors.brandPrimary }]}
          disabled={!allAnswered}
          onPress={() => setShowResults(true)}
        >
          <Text style={styles.checkBtnTxt}>
            {allAnswered ? "Check answers" : `Answer all questions (${Object.keys(answers).length}/${questions.length})`}
          </Text>
        </TouchableOpacity>
      )}
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
  list: {
    gap: 16,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  question: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    lineHeight: 22,
  },
  options: {
    gap: 8,
  },
  optionBtn: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  optionTxt: {
    fontSize: 14,
  },
  explanation: {
    fontSize: 13,
    marginTop: 12,
  },
  scoreBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  scoreTxt: {
    fontSize: 16,
    fontWeight: "700",
  },
  checkBtn: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  checkBtnDisabled: {
    opacity: 0.5,
  },
  checkBtnTxt: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
