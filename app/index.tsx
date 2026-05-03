import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function GetStartedScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>RecipeSnap</Text>
        <Text style={styles.copy}>
          Turn the ingredients you have into healthy recipes you actually want
          to cook.
        </Text>
      </View>
      <Link href="/input" style={styles.button}>
        Get Started
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 96,
    backgroundColor: "#f8f7f4",
  },
  content: {
    gap: 16,
  },
  title: {
    color: "#1f2933",
    fontSize: 42,
    fontWeight: "700",
  },
  copy: {
    color: "#52606d",
    fontSize: 20,
    lineHeight: 30,
  },
  button: {
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: "#1f2933",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    paddingVertical: 18,
    textAlign: "center",
  },
});
