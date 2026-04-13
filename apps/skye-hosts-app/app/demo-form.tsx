/**
 * DEMO PAGE — not linked from navigation.
 *
 * Canonical reference for react-hook-form + applyServerErrors pattern in the
 * host app. Navigate to this screen directly (e.g. router.push('/demo'))
 * to inspect the pattern.
 *
 * Posts to POST /demo/form (DemoController.onSubmitForm — no auth required).
 */
import type {
  IDemoFormRequestDto,
  IDemoFormResponseDto,
} from "../../../packages/skye-hosts-api-client/src";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Chip,
  HelperText,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import { AppSnackbar } from "./components/app-snackbar";
import { ScreenContainer } from "./components/screen-container";
import { fetchApi } from "./services/api";
import {
  borderRadius,
  colors,
  commonStyles,
  lineHeight,
  spacing,
  typography,
} from "./theme";
import { handleFormError } from "./utils/form-error-handler";

interface DemoFormValues {
  name: string;
  email: string;
  message: string;
  category: "general" | "support" | "feedback";
  subscribe: boolean;
  age: string;
  priority: "low" | "medium" | "high";
  website: string;
}

const CATEGORIES: { value: DemoFormValues["category"]; label: string }[] = [
  { value: "general", label: "General" },
  { value: "support", label: "Support" },
  { value: "feedback", label: "Feedback" },
];

const PRIORITIES: { value: DemoFormValues["priority"]; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function DemoScreen() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [result, setResult] = useState<IDemoFormResponseDto | null>(null);

  const {
    control,
    setValue,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DemoFormValues>({
    defaultValues: {
      name: "",
      email: "",
      message: "",
      category: "general",
      subscribe: false,
      age: "",
      priority: "medium",
      website: "",
    },
  });

  const category = watch("category");
  const priority = watch("priority");
  const subscribe = watch("subscribe");

  useEffect(() => {
    const extra = Constants.expoConfig?.extra ?? {};
    console.debug("[demo] env vars:", JSON.stringify(extra, null, 2));
  }, []);

  const onSubmit = async (data: DemoFormValues) => {
    setServerError("");
    setResult(null);
    try {
      const response = await fetchApi<
        IDemoFormResponseDto,
        IDemoFormRequestDto
      >("/demo/form", {
        name: data.name,
        email: data.email,
        message: data.message,
        category: data.category,
        subscribe: data.subscribe,
        age: Number(data.age),
        priority: data.priority,
        website: data.website || undefined,
      });
      setResult(response);
    } catch (e) {
      handleFormError(e, setError, setServerError);
    }
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Demo Form" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={commonStyles.contentScroll}>
        <Text style={styles.description}>
          Demonstrates: useForm + applyServerErrors pattern.{"\n"}
          Posts to POST /demo/form (no auth).
        </Text>

        {/* name */}
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
                disabled={isSubmitting}
                testID="demo-name-input"
              />
            )}
          />
          {errors.name ? (
            <HelperText testID="demo-name-error" type="error" padding="none">
              {errors.name.message}
            </HelperText>
          ) : (
            <HelperText type="info" padding="none">
              Example hint: this field is for your reference only.
            </HelperText>
          )}
        </View>

        {/* email */}
        <View>
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
                label="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={field.value}
                onChangeText={field.onChange}
                error={!!errors.email}
                disabled={isSubmitting}
                testID="demo-email-input"
              />
            )}
          />
          {errors.email && (
            <HelperText testID="demo-email-error" type="error" padding="none">
              {errors.email.message}
            </HelperText>
          )}
        </View>

        {/* age */}
        <View>
          <Controller
            control={control}
            name="age"
            rules={{
              required: "Age is required",
              validate: (v) => {
                const n = Number(v);
                if (isNaN(n) || !Number.isInteger(n))
                  return "Age must be a whole number";
                if (n < 18) return "Must be at least 18";
                if (n > 120) return "Must be 120 or under";
                return true;
              },
            }}
            render={({ field }) => (
              <TextInput
                mode="outlined"
                label="Age"
                keyboardType="numeric"
                value={field.value}
                onChangeText={field.onChange}
                error={!!errors.age}
                disabled={isSubmitting}
                testID="demo-age-input"
              />
            )}
          />
          {errors.age && (
            <HelperText testID="demo-age-error" type="error" padding="none">
              {errors.age.message}
            </HelperText>
          )}
        </View>

        {/* category */}
        <View>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={commonStyles.chipRow}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c.value}
                selected={category === c.value}
                onPress={() => setValue("category", c.value)}
                style={[
                  commonStyles.chip,
                  category === c.value && commonStyles.chipSelected,
                ]}
                textStyle={
                  category === c.value
                    ? commonStyles.chipTextSelected
                    : undefined
                }
                showSelectedCheck={false}
                disabled={isSubmitting}
              >
                {c.label}
              </Chip>
            ))}
          </View>
        </View>

        {/* priority */}
        <View>
          <Text style={styles.fieldLabel}>Priority</Text>
          <View style={commonStyles.chipRow}>
            {PRIORITIES.map((p) => (
              <Chip
                key={p.value}
                selected={priority === p.value}
                onPress={() => setValue("priority", p.value)}
                style={[
                  commonStyles.chip,
                  priority === p.value && commonStyles.chipSelected,
                ]}
                textStyle={
                  priority === p.value
                    ? commonStyles.chipTextSelected
                    : undefined
                }
                showSelectedCheck={false}
                disabled={isSubmitting}
              >
                {p.label}
              </Chip>
            ))}
          </View>
        </View>

        {/* message */}
        <View>
          <Controller
            control={control}
            name="message"
            rules={{ required: "Message is required" }}
            render={({ field }) => (
              <TextInput
                mode="outlined"
                label="Message"
                multiline
                numberOfLines={4}
                value={field.value}
                onChangeText={field.onChange}
                error={!!errors.message}
                disabled={isSubmitting}
                testID="demo-message-input"
                contentStyle={commonStyles.multilineInput}
              />
            )}
          />
          {errors.message && (
            <HelperText testID="demo-message-error" type="error" padding="none">
              {errors.message.message}
            </HelperText>
          )}
        </View>

        {/* website (optional) */}
        <View>
          <Controller
            control={control}
            name="website"
            render={({ field }) => (
              <TextInput
                mode="outlined"
                label="Website (optional)"
                keyboardType="url"
                autoCapitalize="none"
                value={field.value}
                onChangeText={field.onChange}
                error={!!errors.website}
                disabled={isSubmitting}
              />
            )}
          />
          {errors.website && (
            <HelperText type="error" padding="none">
              {errors.website.message}
            </HelperText>
          )}
        </View>

        {/* subscribe */}
        <View style={commonStyles.switchRow}>
          <Text style={commonStyles.switchLabel}>Subscribe to updates</Text>
          <Switch
            value={subscribe}
            onValueChange={(v) => setValue("subscribe", v)}
            disabled={isSubmitting}
          />
        </View>

        {result && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              Submitted! ID: {result.id}
              {"\n"}At: {result.submittedAt}
            </Text>
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
        >
          Submit
        </Button>
      </ScrollView>

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: lineHeight.sm,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  successBox: {
    borderRadius: borderRadius.sm,
    backgroundColor: colors.successBackground,
    padding: spacing.md,
  },
  successText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    lineHeight: lineHeight.sm,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});
