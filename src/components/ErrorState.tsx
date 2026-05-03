import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button label="Try Again" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  message: {
    color: "#52606d",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
});
