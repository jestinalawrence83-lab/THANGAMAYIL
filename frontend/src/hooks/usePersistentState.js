
import { useEffect, useState } from "react";

function readStorage(key, initialValue) {
  try {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : initialValue;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return initialValue;
  }
}

export default function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => ({
    key,
    value: readStorage(key, initialValue),
  }));

  // Load the correct account's data whenever its storage key changes.
  useEffect(() => {
    setState({
      key,
      value: readStorage(key, initialValue),
    });
  }, [key]);

  // Save only when the state belongs to the current account key.
  useEffect(() => {
    if (state.key !== key) return;

    try {
      localStorage.setItem(key, JSON.stringify(state.value));
    } catch (error) {
      console.error(`Unable to save ${key}:`, error);
    }
  }, [key, state]);

  // Prevent showing the previous account's data during key changes.
  const value =
    state.key === key
      ? state.value
      : readStorage(key, initialValue);

  function setValue(update) {
    setState((current) => {
      const currentValue =
        current.key === key
          ? current.value
          : readStorage(key, initialValue);

      const nextValue =
        typeof update === "function"
          ? update(currentValue)
          : update;

      return {
        key,
        value: nextValue,
      };
    });
  }

  return [value, setValue];
}
