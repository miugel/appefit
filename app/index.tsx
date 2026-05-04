import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { OliveLogo } from "@/components/OliveLogo";

export default function GetStartedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <OliveLogo size="lg" />
        <Text style={styles.title}>AppéFit</Text>
        <Text style={styles.copy}>
          Turn the ingredients you have at home into a healthy masterpiece.
        </Text>
      </View>
      <Button
        label="Get Started"
        onPress={() => router.push("/input")}
        variant="olive"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    backgroundColor: "#f8f7f4",
  },
  content: {
    alignItems: "center",
    gap: 18,
    marginTop: "auto",
    marginBottom: "auto",
  },
  title: {
    color: "#1f2933",
    fontSize: 46,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "center",
  },
  copy: {
    maxWidth: 330,
    color: "#52606d",
    fontSize: 20,
    lineHeight: 30,
    textAlign: "center",
  },
});
