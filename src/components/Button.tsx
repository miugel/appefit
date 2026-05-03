import { Pressable, StyleSheet, Text } from "react-native";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function Button({ label, onPress, disabled }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 28,
    paddingVertical: 18,
    backgroundColor: "#1f2933",
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
});
