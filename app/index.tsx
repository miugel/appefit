import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";

export default function GetStartedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoMark}>
          <View style={styles.oliveStem} />
          <View style={styles.oliveLeaf} />
          <View style={styles.oliveBody}>
            <View style={styles.oliveHighlight} />
          </View>
        </View>
        <Text style={styles.title}>AppéFit</Text>
        <Text style={styles.copy}>
          Turn the ingredients you have into healthy recipes you actually want
          to cook.
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
  logoMark: {
    width: 108,
    height: 108,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 54,
    backgroundColor: "#edf3df",
  },
  oliveStem: {
    position: "absolute",
    top: 20,
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: "#566a2f",
    transform: [{ rotate: "18deg" }],
  },
  oliveLeaf: {
    position: "absolute",
    top: 24,
    right: 28,
    width: 31,
    height: 17,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
    backgroundColor: "#9db46e",
    transform: [{ rotate: "-28deg" }],
  },
  oliveBody: {
    width: 54,
    height: 66,
    alignItems: "flex-start",
    borderRadius: 28,
    backgroundColor: "#71843d",
    transform: [{ rotate: "-8deg" }],
  },
  oliveHighlight: {
    width: 14,
    height: 24,
    marginTop: 13,
    marginLeft: 13,
    borderRadius: 10,
    backgroundColor: "#a9ba78",
    opacity: 0.85,
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
