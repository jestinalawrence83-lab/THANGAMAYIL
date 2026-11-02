
export function validateRegister({ name, email, password }) {
  const errors = [];

  if (typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name must contain at least 2 characters.");
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.push("Enter a valid email address.");
  }

  if (typeof password !== "string" || password.length < 8) {
    errors.push("Password must contain at least 8 characters.");
  }

  return errors;
}

export function validateLogin({ email, password }) {
  const errors = [];

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.push("Enter a valid email address.");
  }

  if (typeof password !== "string" || password.length === 0) {
    errors.push("Password is required.");
  }

  return errors;
}
