import type {
  ICreateMessageTemplateRequestDto,
  IGetHostListingsResponseDto,
  IHostListingDto,
  IMessageTemplateDto,
  ITemplateToken,
  IUpdateMessageTemplateRequestDto,
  TriggerType,
} from "../../../../packages/skye-hosts-api-client/src";
import { TRIGGER_TYPE_LABELS } from "../../../../packages/skye-hosts-api-client/src";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  type TextInput as RNTextInput,
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
import { DangerButton } from "../components/danger-button";
import { ScreenContainer } from "../components/screen-container";
import { TemplateTokenPicker } from "../components/template-token-picker";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing, typography } from "../theme";
import { captureException } from "../services/error-reporting";
import { handleFormError } from "../utils/form-error-handler";

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
  const [tokenPickerVisible, setTokenPickerVisible] = useState(false);
  const cursorPositionRef = useRef(0);
  const contentInputRef = useRef<RNTextInput>(null);

  const {
    control,
    handleSubmit,
    setError,
    reset,
    getValues,
    setValue,
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
    } catch (e) {
      captureException(e);
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

  const insertToken = useCallback(
    (token: ITemplateToken) => {
      const current = getValues("content") ?? "";
      const pos = cursorPositionRef.current;
      const tag = `{{${token.key}}}`;
      const updated = current.slice(0, pos) + tag + current.slice(pos);
      setValue("content", updated, { shouldDirty: true });
      cursorPositionRef.current = pos + tag.length;
      setTimeout(() => {
        contentInputRef.current?.focus();
      }, 100);
    },
    [getValues, setValue],
  );

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
      handleFormError(e, setError as any, setServerError);
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
        params: { flash: "Scheduled message deleted" },
      });
    } catch (e) {
      captureException(e);
      setServerError("Failed to delete scheduled message. Please try again.");
      setIsDeleting(false);
    }
  };

  const isBusy = isSubmitting || isDeleting;

  if (isLoadingData) {
    return (
      <ScreenContainer>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content
            title={isNew ? "New scheduled message" : "Edit scheduled message"}
          />
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
        <Appbar.Content
          title={isNew ? "New scheduled message" : "Edit scheduled message"}
        />
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
                label="Name"
                value={field.value}
                onChangeText={field.onChange}
                error={!!errors.name}
                disabled={isBusy}
              />
            )}
          />
          {errors.name ? (
            <HelperText type="error" padding="none">
              {errors.name.message}
            </HelperText>
          ) : (
            <HelperText type="info" padding="none">
              This name is just for you — it won't be included in the message
              sent to your guest.
            </HelperText>
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
                ref={contentInputRef}
                mode="outlined"
                label="Message"
                multiline
                numberOfLines={10}
                value={field.value}
                onChangeText={field.onChange}
                onSelectionChange={(e) => {
                  cursorPositionRef.current = e.nativeEvent.selection.end;
                }}
                error={!!errors.content}
                disabled={isBusy}
                contentStyle={[
                  commonStyles.multilineInput,
                  styles.messageInput,
                ]}
              />
            )}
          />
          {errors.content && (
            <HelperText type="error" padding="none">
              {errors.content.message}
            </HelperText>
          )}
          <Button
            mode="outlined"
            icon="plus"
            onPress={() => setTokenPickerVisible(true)}
            disabled={isBusy}
            style={styles.addDetailsButton}
            compact
          >
            Add details
          </Button>
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
            Which listings should use this scheduled message?
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
          {isNew ? "Create scheduled message" : "Save changes"}
        </Button>

        {!isNew && (
          <DangerButton
            variant="secondary"
            onPress={onDelete}
            loading={isDeleting}
            disabled={isBusy}
            style={styles.deleteButton}
          >
            Delete scheduled message
          </DangerButton>
        )}
      </ScrollView>

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />

      <TemplateTokenPicker
        visible={tokenPickerVisible}
        onDismiss={() => setTokenPickerVisible(false)}
        onSelect={insertToken}
      />
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
  messageInput: {
    minHeight: 200,
  },
  addDetailsButton: {
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  deleteButton: {
    alignSelf: "center",
  },
});
