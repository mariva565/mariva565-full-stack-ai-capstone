import { useCallback, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import type { Course } from "../../lib/studyhub-types";
import { styles } from "./courses-list.styles";

type CourseCardProps = {
  course: Course;
  index: number;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function useCardEntranceAnimation(index: number) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          delay: index * 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, index, slideAnim])
  );

  return { fadeAnim, slideAnim };
}

function CourseActions({
  title,
  onEdit,
  onDelete,
}: {
  title: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.inlineActions}>
      <TouchableOpacity
        style={[styles.inlineActionBtn, styles.inlineEditBtn]}
        onPress={onEdit}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`Edit course ${title}`}
      >
        <Text style={[styles.inlineActionText, styles.inlineEditText]}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.inlineActionBtn, styles.inlineDeleteBtn]}
        onPress={onDelete}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`Delete course ${title}`}
      >
        <Text style={[styles.inlineActionText, styles.inlineDeleteText]}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

export function CourseCard({ course, index, onOpen, onEdit, onDelete }: CourseCardProps) {
  const { fadeAnim, slideAnim } = useCardEntranceAnimation(index);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={styles.courseCard}>
        <View style={styles.cardAccent} />
        <TouchableOpacity
          style={styles.cardContent}
          onPress={onOpen}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Open course ${course.title}`}
        >
          <Text style={styles.courseTitle} numberOfLines={1}>
            {course.title}
          </Text>
          {course.description ? (
            <Text style={styles.courseDesc} numberOfLines={2}>
              {course.description}
            </Text>
          ) : null}
          <Text style={styles.courseDate}>{new Date(course.createdAt).toLocaleDateString()}</Text>
        </TouchableOpacity>
        <CourseActions title={course.title} onEdit={onEdit} onDelete={onDelete} />
      </View>
    </Animated.View>
  );
}
