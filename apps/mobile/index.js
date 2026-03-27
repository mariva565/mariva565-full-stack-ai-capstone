import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import { createElement } from "react";

export function App() {
  const ctx = require.context("./app");
  return createElement(ExpoRoot, { context: ctx });
}

registerRootComponent(App);
