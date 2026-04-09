import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { FormInputModal } from "../components/form-input-modal";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing } from "../theme";
import { handleApiError } from "../utils/form-error-handler";

type DescriptionField =
  | "description"
  | "descriptionLong"
  | "guestAccess"
  | "otherDetailsToNote";

interface FieldConfig {
  key: DescriptionField;
  title: string;
  maxLength: number;
  optional: boolean;
  truncateLines: number;
}

const FIELDS: FieldConfig[] = [
  {
    key: "description",
    title: "Listing description",
    maxLength: 500,
    optional: false,
    truncateLines: 4,
  },
  {
    key: "descriptionLong",
    title: "Your property",
    maxLength: 4000,
    optional: true,
    truncateLines: 2,
  },
  {
    key: "guestAccess",
    title: "Guest access",
    maxLength: 500,
    optional: true,
    truncateLines: 4,
  },
  {
    key: "otherDetailsToNote",
    title: "Other details to note",
    maxLength: 500,
    optional: true,
    truncateLines: 4,
  },
];

export default function EditDescriptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<IGetListingResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeField, setActiveField] = useState<FieldConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const fetchListing = useCallback(async () => {
    try {
      const data = await fetchApi<IGetListingResponseDto>(`/listing/${id}`);
      setListing(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const handleSave = async (value: string) => {
    if (!activeField || !listing) return;
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(
        `/listing/${listing.id}`,
        { [activeField.key]: value },
        { method: "PATCH" },
      );
      setListing(updated);
      setActiveField(null);
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit description" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={commonStyles.borderedRows}>
            {FIELDS.map((field, index) => {
              const value = listing?.[field.key] ?? "";
              const hasValue = value.length > 0;

              return (
                <View key={field.key}>
                  {index > 0 && (
                    <View style={commonStyles.borderedRowDivider} />
                  )}
                  <Pressable
                    style={commonStyles.borderedRowContent}
                    onPress={() => setActiveField(field)}
                  >
                    <View style={commonStyles.borderedRowText}>
                      <Text style={commonStyles.itemTitle}>{field.title}</Text>
                      <Text
                        style={[
                          commonStyles.itemSubtext,
                          !hasValue && styles.rowSubtextEmpty,
                        ]}
                        numberOfLines={field.truncateLines}
                      >
                        {hasValue ? value : "Add details"}
                      </Text>
                    </View>
                    <Text style={commonStyles.menuItemAction}>Edit</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
      {activeField && listing && (
        <FormInputModal
          visible={!!activeField}
          onDismiss={() => setActiveField(null)}
          title={`Edit ${activeField.title.toLowerCase()}`}
          value={listing[activeField.key] ?? ""}
          onSave={handleSave}
          maxLength={activeField.maxLength}
          loading={saving}
          optional={activeField.optional}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xl,
  },
  content: {
    padding: spacing.lg,
  },
  rowSubtextEmpty: {
    fontStyle: "italic",
  },
});
