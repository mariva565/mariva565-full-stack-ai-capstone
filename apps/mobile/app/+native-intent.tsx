type NativeIntentOptions = {
  path: string;
  initial: boolean;
};

const NATIVE_URL_BASE = "studyhubv2://app.home";

function isOAuthRedirect(path: string): boolean {
  try {
    const url = new URL(path, NATIVE_URL_BASE);
    return url.hostname === "oauthredirect" || url.pathname === "/oauthredirect";
  } catch {
    return false;
  }
}

export function redirectSystemPath({ path }: NativeIntentOptions): string {
  if (isOAuthRedirect(path)) {
    return "/login";
  }

  return path;
}
