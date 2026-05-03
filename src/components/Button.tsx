import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "olive";
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  disabled,
  variant = "primary",
  style,
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        variant === "secondary" && styles.secondary,
        variant === "olive" && styles.olive,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === "secondary" && styles.secondaryLabel,
          variant === "olive" && styles.oliveLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "#1f2933",
  },
  secondary: {
    borderWidth: 1,
    borderColor: "#d8d3ca",
    backgroundColor: "#ffffff",
  },
  olive: {
    backgroundColor: "#d8e7b8",
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryLabel: {
    color: "#1f2933",
  },
  oliveLabel: {
    color: "#26351d",
  },
});
