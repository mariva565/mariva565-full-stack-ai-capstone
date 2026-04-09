import { Image, Text, View } from "react-native";

import { styles } from "./auth-brand-hero.styles";

type AuthBrandHeroProps = {
  subtitle: string;
  description: string;
};

export function AuthBrandHero({ subtitle, description }: AuthBrandHeroProps) {
  return (
    <View style={styles.container}>
      <View style={styles.visualRow}>
        <Image
          source={require("../../assets/branding/mascot.png")}
          style={styles.mascot}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          accessible={false}
        />
      </View>

      <Text style={styles.brandTitle}>
        Study<Text style={styles.brandTitleAccent}>Hub</Text>
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}
