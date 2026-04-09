import { useFonts } from "expo-font";

export const AUTH_BRAND_FONT_FAMILY = "ShantellSans800";

export function useAuthBrandFont(): boolean {
  const [loaded] = useFonts({
    [AUTH_BRAND_FONT_FAMILY]: require("../../assets/fonts/ShantellSans_800ExtraBold.ttf"),
  });

  return loaded;
}
