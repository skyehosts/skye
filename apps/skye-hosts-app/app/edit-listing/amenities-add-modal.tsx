import type { ListingAmenityId } from "../../../../packages/skye-hosts-api-client/src";
import { LISTING_AMENITY_CATEGORIES } from "../../../../packages/skye-hosts-api-client/src";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, Chip, Icon, Modal, Portal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import {
  borderRadius,
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";

interface AmenitiesAddModalProps {
  visible: boolean;
  onDismiss: () => void;
  selectedAmenities: ListingAmenityId[];
  onSave: (amenities: ListingAmenityId[]) => void;
}

export function AmenitiesAddModal({
  visible,
  onDismiss,
  selectedAmenities,
  onSave,
}: AmenitiesAddModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setSelected(new Set(selectedAmenities));
      setActiveCategory(null);
    }
  }, [visible, selectedAmenities]);

  const filteredCategories = activeCategory
    ? LISTING_AMENITY_CATEGORIES.filter((cat) => cat.id === activeCategory)
    : LISTING_AMENITY_CATEGORIES;

  const allAmenities = filteredCategories.flatMap((cat) =>
    cat.amenities.map((a) => ({ ...a, categoryTitle: cat.title })),
  );

  const handleToggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = () => {
    onSave(Array.from(selected) as ListingAmenityId[]);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={commonStyles.row}>
          <Text style={commonStyles.modalTitle}>Add amenities</Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.iconMuted} />
          </Pressable>
        </View>

        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            <Chip
              selected={activeCategory === null}
              onPress={() => setActiveCategory(null)}
              style={[
                commonStyles.chip,
                activeCategory === null && commonStyles.chipSelected,
              ]}
              textStyle={
                activeCategory === null
                  ? commonStyles.chipTextSelected
                  : undefined
              }
            >
              All
            </Chip>
            {LISTING_AMENITY_CATEGORIES.map((cat) => (
              <Chip
                key={cat.id}
                selected={activeCategory === cat.id}
                onPress={() =>
                  setActiveCategory(activeCategory === cat.id ? null : cat.id)
                }
                style={[
                  commonStyles.chip,
                  activeCategory === cat.id && commonStyles.chipSelected,
                ]}
                textStyle={
                  activeCategory === cat.id
                    ? commonStyles.chipTextSelected
                    : undefined
                }
              >
                {cat.title}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={allAmenities}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.listContainer}
          renderItem={({ item }) => {
            const isSelected = selected.has(item.id);
            return (
              <Pressable
                style={styles.amenityRow}
                onPress={() => handleToggle(item.id)}
              >
                <Icon
                  source={item.icon}
                  size={22}
                  color={colors.iconDecorative}
                />
                <Text style={styles.amenityText}>{item.title}</Text>
                {isSelected ? (
                  <Icon
                    source="check-circle"
                    size={22}
                    color={colors.success}
                  />
                ) : (
                  <Icon
                    source="plus-circle-outline"
                    size={22}
                    color={colors.icon}
                  />
                )}
              </Pressable>
            );
          }}
        />

        <View style={commonStyles.divider} />

        <View style={commonStyles.row}>
          <Button mode="text" onPress={onDismiss}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSave}>
            Save
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.background,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
    gap: spacing.md,
    flex: 1,
  },
  categoryScroll: {
    gap: spacing.sm,
  },
  listContainer: {
    flex: 1,
  },
  amenityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  amenityText: {
    flex: 1,
    fontSize: typography.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
});
