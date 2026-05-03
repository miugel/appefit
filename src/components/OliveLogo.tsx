import { StyleSheet, View } from "react-native";

type Props = {
  size?: "sm" | "lg";
};

export function OliveLogo({ size = "lg" }: Props) {
  const s = size === "sm" ? 0.5 : 1;

  return (
    <View
      style={[
        styles.logoMark,
        { width: 108 * s, height: 108 * s, borderRadius: 54 * s },
      ]}
    >
      <View
        style={[
          styles.oliveStem,
          {
            top: 20 * s,
            width: 4 * s,
            height: 22 * s,
            borderRadius: 2 * s,
          },
        ]}
      />
      <View
        style={[
          styles.oliveLeaf,
          {
            top: 24 * s,
            right: 28 * s,
            width: 31 * s,
            height: 17 * s,
            borderTopLeftRadius: 18 * s,
            borderTopRightRadius: 4 * s,
            borderBottomLeftRadius: 4 * s,
            borderBottomRightRadius: 18 * s,
          },
        ]}
      />
      <View
        style={[
          styles.oliveBody,
          {
            width: 54 * s,
            height: 66 * s,
            borderRadius: 28 * s,
          },
        ]}
      >
        <View
          style={[
            styles.oliveHighlight,
            {
              width: 14 * s,
              height: 24 * s,
              marginTop: 13 * s,
              marginLeft: 13 * s,
              borderRadius: 10 * s,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoMark: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#edf3df",
  },
  oliveStem: {
    position: "absolute",
    backgroundColor: "#566a2f",
    transform: [{ rotate: "18deg" }],
  },
  oliveLeaf: {
    position: "absolute",
    backgroundColor: "#9db46e",
    transform: [{ rotate: "-28deg" }],
  },
  oliveBody: {
    alignItems: "flex-start",
    backgroundColor: "#71843d",
    transform: [{ rotate: "-8deg" }],
  },
  oliveHighlight: {
    backgroundColor: "#a9ba78",
    opacity: 0.85,
  },
});
