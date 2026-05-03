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
    borderColor: "#c8d99a",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#edf3df",
    color: "#26351d",
    fontSize: 14,
    fontWeight: "700",
  },
});
