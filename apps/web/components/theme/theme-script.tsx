import { themeInitScript } from "./theme-utils";

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />;
}
