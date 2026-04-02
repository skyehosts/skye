import {
  type IGetListingResponseDto,
  type IUpdateListingRequestDto,
  type ListingSpaceType,
  type ListingTypeId,
  type PropertySizeUnit,
  LISTING_SPACE_TYPE_LABELS,
  LISTING_TYPE_LABELS,
  LISTING_TYPE_IDS,
  LISTING_SPACE_TYPES,
  PROPERTY_SIZE_UNIT_LABELS,
  PROPERTY_SIZE_UNITS,
} from "../../../../packages/skye-hosts-api-client/src";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Modal, Portal, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { AppSnackbar } from "../components/app-snackbar";
import { DropdownField } from "../components/dropdown-field";
import { NumberStepper } from "../components/number-stepper";
import { fetchApi } from "../services/api";
import {
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";
import { handleApiError } from "../utils/form-error-handler";

interface PropertyTypeModalProps {
  visible: boolean;
  onDismiss: () => void;
  listing: IGetListingResponseDto;
  onSaved: (updated: IGetListingResponseDto) => void;
}

interface FormState {
  typeId: ListingTypeId;
  spaceType: ListingSpaceType;
  totalFloors: number;
  listingFloor: number;
  yearBuilt: string;
  propertySize: string;
  propertySizeUnit: PropertySizeUnit;
}

const typeIdOptions = LISTING_TYPE_IDS.map((id) => ({
  value: id,
  label: LISTING_TYPE_LABELS[id],
}));

const spaceTypeOptions = LISTING_SPACE_TYPES.map((id) => ({
  value: id,
  label: LISTING_SPACE_TYPE_LABELS[id],
}));

const sizeUnitOptions = PROPERTY_SIZE_UNITS.map((id) => ({
  value: id,
  label: PROPERTY_SIZE_UNIT_LABELS[id],
}));

export function PropertyTypeModal({
  visible,
  onDismiss,
  listing,
  onSaved,
}: PropertyTypeModalProps) {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [form, setForm] = useState<FormState>({
    typeId: listing.typeId,
    spaceType: listing.spaceType,
    totalFloors: listing.totalFloors,
    listingFloor: listing.listingFloor,
    yearBuilt: listing.yearBuilt,
    propertySize: listing.propertySize,
    propertySizeUnit: listing.propertySizeUnit,
  });

  useEffect(() => {
    if (visible) {
      setForm({
        typeId: listing.typeId,
        spaceType: listing.spaceType,
        totalFloors: listing.totalFloors,
        listingFloor: listing.listingFloor,
        yearBuilt: listing.yearBuilt,
        propertySize: listing.propertySize,
        propertySizeUnit: listing.propertySizeUnit,
      });
    }
  }, [visible, listing]);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(
        `/listing/${listing.id}`,
        {
          typeId: form.typeId,
          spaceType: form.spaceType,
          totalFloors: form.totalFloors,
          listingFloor: form.listingFloor,
          yearBuilt: form.yearBuilt,
          propertySize: form.propertySize,
          propertySizeUnit: form.propertySizeUnit,
        },
        { method: "PATCH" },
      );
      onSaved(updated);
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={commonStyles.modal}
      >
        <View style={commonStyles.row}>
          <Text style={commonStyles.modalTitle}>Property type</Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.iconMuted} />
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.fields}>
            <DropdownField
              label="Property type"
              value={form.typeId}
              options={typeIdOptions}
              onChange={(v) => updateField("typeId", v)}
            />

            <DropdownField
              label="Listing type"
              value={form.spaceType}
              options={spaceTypeOptions}
              onChange={(v) => updateField("spaceType", v)}
            />

            <NumberStepper
              label="How many floors in the building?"
              value={form.totalFloors}
              onChange={(v) => updateField("totalFloors", v)}
              min={1}
            />

            <NumberStepper
              label="Which floor is the listing on?"
              value={form.listingFloor}
              onChange={(v) => updateField("listingFloor", v)}
              min={1}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Year built</Text>
              <TextInput
                mode="outlined"
                value={form.yearBuilt}
                onChangeText={(v) => updateField("yearBuilt", v)}
                keyboardType="number-pad"
                maxLength={4}
                disabled={saving}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Property size</Text>
              <View style={styles.sizeRow}>
                <View style={styles.sizeInput}>
                  <TextInput
                    mode="outlined"
                    value={form.propertySize}
                    onChangeText={(v) => updateField("propertySize", v)}
                    keyboardType="number-pad"
                    disabled={saving}
                  />
                </View>
                <View style={styles.sizeUnit}>
                  <DropdownField
                    label=""
                    value={form.propertySizeUnit}
                    options={sizeUnitOptions}
                    onChange={(v) => updateField("propertySizeUnit", v)}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={commonStyles.divider} />

        <View style={commonStyles.row}>
          <Button mode="text" onPress={onDismiss} disabled={saving}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
          >
            Save
          </Button>
        </View>
      </Modal>
      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </Portal>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 400,
  },
  fields: {
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  sizeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  sizeInput: {
    flex: 1,
  },
  sizeUnit: {
    flex: 1,
  },
});
