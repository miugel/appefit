import { StyleSheet, Text } from "react-native";

type IngredientChipProps = {
  label: string;
};

export function IngredientChip({ label }: IngredientChipProps) {
  return <Text style={styles.chip}>{label}</Text>;
}

const styles = StyleSheet.create({
  chip: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d8d3ca",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#ffffff",
    color: "#52606d",
    fontSize: 14,
    fontWeight: "700",
  },
});
