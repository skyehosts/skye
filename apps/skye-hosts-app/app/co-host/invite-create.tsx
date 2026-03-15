import type {
  CoHostRole,
  ICreateCoHostInviteResponseDto,
  IGetHostListingsResponseDto,
  IHostListingDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useForm } from "react-hook-form";
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
import { handleFormError } from "../utils/form-error-handler";

const ROLE_OPTIONS: {
  value: CoHostRole;
  label: string;
  description: string;
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
  },
  {
    value: "calendar_only",
    label: "Calendar Only",
    description: "Can only view calendar and booking dates",
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
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormValues>({
    defaultValues: { email: "", role: "full_access" },
  });

  const email = watch("email");
  const selectedRole = watch("role");

  useEffect(() => {
    if (!listingId) return;
    (async () => {
      try {
        const data = await fetchApi<IGetHostListingsResponseDto>("/listing");
        const found = data.listings.find((l) => l.id === Number(listingId));
        if (found) setListing(found);
      } catch {
        // Non-critical, just won't show listing name
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

  const onShareLink = useCallback(async () => {
    if (!inviteLink) return;
    await Share.share({
      message: `You've been invited to co-host ${listing?.title ?? "a listing"} on Skye Hosts! Open this link to accept: ${inviteLink}`,
    });
  }, [inviteLink, listing]);

  if (inviteLink) {
    return (
      <ScreenContainer>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Invite Sent" />
        </Appbar.Header>
        <View style={styles.successContent}>
          <Text style={styles.successTitle}>Invite created!</Text>
          <Text style={commonStyles.bodyText}>
            Share this link with your co-host. The invite expires in 7 days.
          </Text>
          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={2}>
              {inviteLink}
            </Text>
          </View>
          <Button mode="contained" onPress={onShareLink} icon="share">
            Share invite link
          </Button>
          <Button mode="outlined" onPress={() => router.back()}>
            Done
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
            <TextInput
              mode="outlined"
              label="Invitee email"
              placeholder="co-host@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={(v) => {
                setValue("email", v);
                if (errors.email) clearErrors("email");
              }}
              disabled={isSubmitting}
              error={!!errors.email}
            />
            {errors.email && (
              <HelperText type="error">{errors.email.message}</HelperText>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Permission level</Text>
            <View style={styles.roleOptions}>
              {ROLE_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.roleCard,
                    selectedRole === option.value && styles.roleCardSelected,
                  ]}
                  onPress={() => setValue("role", option.value)}
                >
                  <Text
                    style={[
                      styles.roleLabel,
                      selectedRole === option.value && styles.roleLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
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
            disabled={isSubmitting || !email.trim()}
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
  linkBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBackground,
  },
  linkText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
