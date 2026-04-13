import type {
  CoHostRole,
  ICreateCoHostInviteResponseDto,
  IGetHostListingsResponseDto,
  IHostListingDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import {
  Appbar,
  Button,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import {
  borderRadius,
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";
import { captureException } from "../services/error-reporting";
import { handleFormError } from "../utils/form-error-handler";

const ROLE_OPTIONS: {
  value: CoHostRole;
  label: string;
  description: string;
  comingSoon?: boolean;
}[] = [
  {
    value: "full_access",
    label: "Full Access",
    description:
      "Can manage listing, calendar, messaging, reservations, and co-hosts",
  },
  {
    value: "calendar_and_messaging",
    label: "Calendar & Messaging",
    description: "Can view calendar and message guests",
    comingSoon: true,
  },
  {
    value: "calendar_only",
    label: "Calendar Only",
    description: "Can only view calendar and booking dates",
    comingSoon: true,
  },
];

interface InviteFormValues {
  email: string;
  role: CoHostRole;
}

export default function InviteCreateScreen() {
  const router = useRouter();
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const [serverError, setServerError] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [listing, setListing] = useState<IHostListingDto | null>(null);
  const [isLoadingListing, setIsLoadingListing] = useState(!!listingId);

  const {
    control,
    setValue,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormValues>({
    defaultValues: { email: "", role: "full_access" },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (!listingId) return;
    (async () => {
      try {
        const data = await fetchApi<IGetHostListingsResponseDto>("/listing");
        const found = data.listings.find((l) => l.id === Number(listingId));
        if (found) setListing(found);
      } catch (e) {
        captureException(e);
      } finally {
        setIsLoadingListing(false);
      }
    })();
  }, [listingId]);

  const onSubmit = async (data: InviteFormValues) => {
    setServerError("");
    try {
      const result = await fetchApi<ICreateCoHostInviteResponseDto>(
        "/co-host-invite",
        {
          listingId: Number(listingId),
          inviteeEmail: data.email,
          role: data.role,
        },
      );
      setInviteLink(result.inviteLink);
    } catch (e) {
      handleFormError(e, setError, setServerError);
    }
  };

  if (inviteLink) {
    return (
      <ScreenContainer>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Invite Sent" />
        </Appbar.Header>
        <View style={styles.successContent}>
          <Text style={styles.successTitle}>Invite sent!</Text>
          <Text style={commonStyles.bodyText}>
            We've emailed your co-host an invite to join
            {listing ? ` ${listing.title}` : " your listing"}. The invite
            expires in 7 days.
          </Text>
          <Button mode="contained" onPress={() => router.back()}>
            Back to Co-hosts
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Invite Co-Host" />
      </Appbar.Header>

      {isLoadingListing ? (
        <View style={commonStyles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          {listing && (
            <View style={styles.listingBanner}>
              <Text style={styles.listingBannerLabel}>Listing</Text>
              <Text style={styles.listingBannerTitle}>{listing.title}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              }}
              render={({ field }) => (
                <TextInput
                  mode="outlined"
                  label="Invitee email"
                  placeholder="co-host@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={field.value}
                  onChangeText={field.onChange}
                  disabled={isSubmitting}
                  error={!!errors.email}
                />
              )}
            />
            {errors.email && (
              <HelperText type="error" padding="none">
                {errors.email.message}
              </HelperText>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Permission level</Text>
            <View style={styles.roleOptions}>
              {ROLE_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  disabled={option.comingSoon}
                  style={[
                    styles.roleCard,
                    selectedRole === option.value && styles.roleCardSelected,
                    option.comingSoon && styles.roleCardDisabled,
                  ]}
                  onPress={() => setValue("role", option.value)}
                >
                  <View style={styles.roleLabelRow}>
                    <Text
                      style={[
                        styles.roleLabel,
                        selectedRole === option.value &&
                          styles.roleLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.comingSoon && (
                      <View style={commonStyles.comingSoonBadge}>
                        <Text style={commonStyles.comingSoonBadgeText}>
                          Coming soon
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.roleDescription}>
                    {option.description}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Send Invite
          </Button>
        </ScrollView>
      )}

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  listingBanner: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  listingBannerLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  listingBannerTitle: {
    fontSize: typography.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  roleOptions: {
    gap: spacing.sm,
  },
  roleCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  roleCardSelected: {
    borderColor: colors.textPrimary,
    borderWidth: 2,
  },
  roleLabel: {
    fontSize: typography.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  roleLabelSelected: {
    color: colors.textPrimary,
  },
  roleDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  roleCardDisabled: {
    opacity: 0.5,
  },
  roleLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  successContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
    gap: spacing.md,
  },
  successTitle: {
    fontSize: typography.xl,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
});
