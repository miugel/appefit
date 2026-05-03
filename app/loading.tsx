import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function LoadingScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => router.replace("/recipes"), 600);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator color="#1f2933" size="large" />
      <Text style={styles.title}>Analyzing ingredients...</Text>
      <Text style={styles.copy}>Building healthy recipe ideas.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 24,
    backgroundColor: "#f8f7f4",
  },
  title: {
    color: "#1f2933",
    fontSize: 22,
    fontWeight: "700",
  },
  copy: {
    color: "#52606d",
    fontSize: 16,
  },
});
