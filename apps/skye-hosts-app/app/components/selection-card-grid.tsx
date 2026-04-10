import { FlatList, Pressable, StyleSheet, Text } from "react-native";
import { Icon } from "react-native-paper";
import {
  borderRadius,
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";

export interface SelectionCardItem {
  id: string;
  title: string;
  icon: string;
}

interface Props {
  items: SelectionCardItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function SelectionCardGrid({ items, selectedIds, onToggle }: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={2}
      scrollEnabled={false}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const isSelected = selectedIds.includes(item.id);
        return (
          <Pressable
            style={[styles.card, isSelected && commonStyles.cardSelected]}
            onPress={() => onToggle(item.id)}
          >
            <Icon
              source={item.icon}
              size={32}
              color={isSelected ? colors.primary : colors.iconDecorative}
            />
            <Text
              style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}
            >
              {item.title}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    gap: spacing.md,
  },
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  cardTitleSelected: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
});
