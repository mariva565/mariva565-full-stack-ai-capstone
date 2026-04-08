const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRequired(value: string, fieldLabel: string): string | null {
  if (!value.trim()) {
    return `${fieldLabel} is required`;
  }

  return null;
}

export function validateEmail(value: string): string | null {
  const requiredError = validateRequired(value, "Email");
  if (requiredError) {
    return requiredError;
  }

  if (!EMAIL_REGEX.test(value.trim())) {
    return "Please enter a valid email address";
  }

  return null;
}

export function validateMinLength(
  value: string,
  minLength: number,
  fieldLabel: string
): string | null {
  const requiredError = validateRequired(value, fieldLabel);
  if (requiredError) {
    return requiredError;
  }

  if (value.length < minLength) {
    return `${fieldLabel} must be at least ${minLength} characters`;
  }

  return null;
}

