import type {
  ICreateMessageTemplateRequestDto,
  IGetHostListingsResponseDto,
  IHostListingDto,
  IMessageTemplateDto,
  IUpdateMessageTemplateRequestDto,
  TriggerType,
} from "@repo/skye-hosts-api-client";
import { TRIGGER_TYPE_LABELS } from "@repo/skye-hosts-api-client";
import { applyServerErrors } from "@repo/web-components/forms/apply-server-errors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Appbar,
  Button,
  Checkbox,
  Chip,
  Divider,
  HelperText,
  TextInput,
} from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing, typography } from "../theme";

interface FormValues {
  name: string;
  content: string;
  triggerPreset: TriggerType | null;
}

const TRIGGER_PRESETS = (
  Object.entries(TRIGGER_TYPE_LABELS) as [TriggerType, string][]
).map(([value, label]) => ({ value, label }));

const PRESET_TRIGGER_INPUT = (triggerType: TriggerType) => ({
  triggerType,
  offsetValue:
    triggerType === "before_check_in" || triggerType === "before_checkout"
      ? 1
      : 0,
  offsetUnit:
    triggerType === "before_check_in" || triggerType === "before_checkout"
      ? ("days" as const)
      : ("hours" as const),
  sendIfPast: true,
  allowMultiplePerBooking: false,
});

export default function MessageTemplateFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";

  const [isLoadingData, setIsLoadingData] = useState(!isNew);
  const [isDeleting, setIsDeleting] = useState(false);
  const [listings, setListings] = useState<IHostListingDto[]>([]);
  const [selectedListingIds, setSelectedListingIds] = useState<number[]>([]);
  const [serverError, setServerError] = useState("");

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: "", content: "", triggerPreset: null },
  });

  const loadData = useCallback(async () => {
    try {
      const [listingsData, templateData] = await Promise.all([
        fetchApi<IGetHostListingsResponseDto>("/listing"),
        isNew ? null : fetchApi<IMessageTemplateDto>(`/message-template/${id}`),
      ]);

      setListings(listingsData.listings);

      if (templateData) {
        setSelectedListingIds(templateData.listingIds);
        reset({
          name: templateData.name,
          content: templateData.activeVersion?.content ?? "",
          triggerPreset: templateData.triggers[0]?.triggerType ?? null,
        });
      }
    } catch {
      setServerError("Failed to load data. Please go back and try again.");
    } finally {
      setIsLoadingData(false);
    }
  }, [id, isNew, reset]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleListing = (listingId: number) => {
    setSelectedListingIds((prev) =>
      prev.includes(listingId)
        ? prev.filter((lid) => lid !== listingId)
        : [...prev, listingId],
    );
  };

  const onSubmit = async (data: FormValues) => {
    setServerError("");

    const payload: ICreateMessageTemplateRequestDto &
      IUpdateMessageTemplateRequestDto = {
      name: data.name,
      channel: "in_app",
      content: data.content,
      listingIds: selectedListingIds,
      triggers: data.triggerPreset
        ? [PRESET_TRIGGER_INPUT(data.triggerPreset)]
        : [],
    };

    try {
      if (isNew) {
        await fetchApi<IMessageTemplateDto, typeof payload>(
          "/message-template",
          payload,
        );
      } else {
        await fetchApi<IMessageTemplateDto, typeof payload>(
          `/message-template/${id}`,
          payload,
          { method: "PUT" },
        );
      }
      router.back();
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (applyServerErrors(e, setError as any)) return;
      setServerError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      await fetchApi(`/message-template/${id}`, undefined, {
        method: "DELETE",
      });
      router.replace({
        pathname: "/message-templates",
        params: { flash: "Template deleted" },
      });
    } catch {
      setServerError("Failed to delete template. Please try again.");
      setIsDeleting(false);
    }
  };

  const isBusy = isSubmitting || isDeleting;

  if (isLoadingData) {
    return (
      <ScreenContainer>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={isNew ? "New template" : "Edit template"} />
        </Appbar.Header>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={isNew ? "New template" : "Edit template"} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={commonStyles.contentScroll}>
        {/* Name */}
        <View>
          <Controller
            control={control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <TextInput
                mode="outlined"
                label="Template name"
                value={field.value}
                onChangeText={field.onChange}
                error={!!errors.name}
                disabled={isBusy}
              />
            )}
          />
          {errors.name && (
            <HelperText type="error">{errors.name.message}</HelperText>
          )}
        </View>

        {/* Content */}
        <View>
          <Controller
            control={control}
            name="content"
            rules={{ required: "Message content is required" }}
            render={({ field }) => (
              <TextInput
                mode="outlined"
                label="Message"
                multiline
                numberOfLines={5}
                value={field.value}
                onChangeText={field.onChange}
                error={!!errors.content}
                disabled={isBusy}
                contentStyle={commonStyles.multilineInput}
              />
            )}
          />
          {errors.content && (
            <HelperText type="error">{errors.content.message}</HelperText>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Listings */}
        <View>
          <Text
            style={[commonStyles.sectionTitle, { marginBottom: spacing.xs }]}
          >
            Listings
          </Text>
          <Text style={styles.sectionSubtitle}>
            Which listings should use this template?
          </Text>
          {listings.length === 0 && (
            <Text style={styles.emptyHint}>No listings found.</Text>
          )}
          {listings.map((listing) => (
            <Checkbox.Item
              key={listing.id}
              label={listing.title}
              status={
                selectedListingIds.includes(listing.id)
                  ? "checked"
                  : "unchecked"
              }
              onPress={() => toggleListing(listing.id)}
              disabled={isBusy}
              style={styles.checkboxItem}
            />
          ))}
        </View>

        <Divider style={styles.divider} />

        {/* Trigger */}
        <View>
          <Text
            style={[commonStyles.sectionTitle, { marginBottom: spacing.xs }]}
          >
            When to send
          </Text>
          <Text style={styles.sectionSubtitle}>
            Select when this message should be sent.
          </Text>

          <Controller
            control={control}
            name="triggerPreset"
            render={({ field }) => (
              <View style={commonStyles.chipRow}>
                {TRIGGER_PRESETS.map((opt) => (
                  <Chip
                    key={opt.value}
                    selected={field.value === opt.value}
                    onPress={() =>
                      field.onChange(
                        field.value === opt.value ? null : opt.value,
                      )
                    }
                    style={[
                      commonStyles.chip,
                      field.value === opt.value && commonStyles.chipSelected,
                    ]}
                    textStyle={
                      field.value === opt.value
                        ? commonStyles.chipTextSelected
                        : undefined
                    }
                    showSelectedCheck={false}
                    disabled={isBusy}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </View>
            )}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isBusy}
          style={styles.saveButton}
        >
          {isNew ? "Create template" : "Save changes"}
        </Button>

        {!isNew && (
          <Button
            mode="text"
            textColor={colors.danger}
            onPress={onDelete}
            loading={isDeleting}
            disabled={isBusy}
            style={styles.deleteButton}
          >
            Delete template
          </Button>
        )}
      </ScrollView>

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    marginVertical: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  checkboxItem: {
    paddingHorizontal: 0,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  deleteButton: {
    alignSelf: "center",
  },
});
