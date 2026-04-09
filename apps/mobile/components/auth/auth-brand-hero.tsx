import { Image, Text, View } from "react-native";

import { styles } from "./auth-brand-hero.styles";
import { AUTH_BRAND_FONT_FAMILY, useAuthBrandFont } from "./use-auth-brand-font";

type AuthBrandHeroProps = {
  subtitle: string;
  description: string;
};

export function AuthBrandHero({ subtitle, description }: AuthBrandHeroProps) {
  const brandFontLoaded = useAuthBrandFont();

  return (
    <View style={styles.container}>
      <View style={styles.visualRow}>
        <Image
          source={require("../../assets/branding/mascot.png")}
          style={styles.mascot}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>

      <Text
        style={[styles.brandTitle, brandFontLoaded ? { fontFamily: AUTH_BRAND_FONT_FAMILY } : null]}
      >
        Study<Text style={styles.brandTitleAccent}>Hub</Text>
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}
