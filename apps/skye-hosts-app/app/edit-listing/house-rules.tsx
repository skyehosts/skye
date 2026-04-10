import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { HOUSE_RULES_CONFIG } from "../../../../packages/skye-hosts-api-client/src";
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
import { Appbar, Switch } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { AppSnackbar } from "../components/app-snackbar";
import { FormInputModal } from "../components/form-input-modal";
import { ActionBar } from "../components/action-bar";
import { ScreenContainer } from "../components/screen-container";
import { DEFAULT_TIME, TimeRangePicker } from "../components/time-range-picker";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing, typography } from "../theme";
import { handleApiError } from "../utils/form-error-handler";

interface RulesState {
  houseRulePetsAllowed: boolean | null;
  houseRuleChildrenAllowed: boolean;
  houseRuleInfantsAllowed: boolean;
  houseRuleEventsAllowed: boolean | null;
  houseRuleSmokingAllowed: boolean | null;
  houseRuleVapingAllowed: boolean | null;
  houseRuleQuietHoursEnabled: boolean | null;
  houseRuleQuietHoursStart: string;
  houseRuleQuietHoursEnd: string;
  houseRuleOtherRules: string | null;
}

function initState(listing: IGetListingResponseDto): RulesState {
  return {
    houseRulePetsAllowed: listing.houseRulePetsAllowed,
    houseRuleChildrenAllowed: listing.houseRuleChildrenAllowed,
    houseRuleInfantsAllowed: listing.houseRuleInfantsAllowed,
    houseRuleEventsAllowed: listing.houseRuleEventsAllowed,
    houseRuleSmokingAllowed: listing.houseRuleSmokingAllowed,
    houseRuleVapingAllowed: listing.houseRuleVapingAllowed,
    houseRuleQuietHoursEnabled: listing.houseRuleQuietHoursEnabled,
    houseRuleQuietHoursStart: listing.houseRuleQuietHoursStart ?? DEFAULT_TIME,
    houseRuleQuietHoursEnd: listing.houseRuleQuietHoursEnd ?? DEFAULT_TIME,
    houseRuleOtherRules: listing.houseRuleOtherRules,
  };
}

const RULE_ICON_SIZE = 22;
const RULE_ICON_WIDTH = 24;

export default function HouseRulesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<IGetListingResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [rules, setRules] = useState<RulesState | null>(null);
  const [otherRulesModalVisible, setOtherRulesModalVisible] = useState(false);

  const fetchListing = useCallback(async () => {
    try {
      const data = await fetchApi<IGetListingResponseDto>(`/listing/${id}`);
      setListing(data);
      setRules(initState(data));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const updateRule = <K extends keyof RulesState>(
    key: K,
    value: RulesState[K],
  ) => {
    setRules((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!rules) return;
    setSaving(true);
    setServerError("");
    try {
      await fetchApi<IGetListingResponseDto, IUpdateListingRequestDto>(
        `/listing/${id}`,
        {
          houseRulePetsAllowed: rules.houseRulePetsAllowed,
          houseRuleChildrenAllowed: rules.houseRuleChildrenAllowed,
          houseRuleInfantsAllowed: rules.houseRuleInfantsAllowed,
          houseRuleEventsAllowed: rules.houseRuleEventsAllowed,
          houseRuleSmokingAllowed: rules.houseRuleSmokingAllowed,
          houseRuleVapingAllowed: rules.houseRuleVapingAllowed,
          houseRuleQuietHoursEnabled: rules.houseRuleQuietHoursEnabled,
          houseRuleQuietHoursStart: rules.houseRuleQuietHoursEnabled
            ? rules.houseRuleQuietHoursStart
            : null,
          houseRuleQuietHoursEnd: rules.houseRuleQuietHoursEnabled
            ? rules.houseRuleQuietHoursEnd
            : null,
          houseRuleOtherRules: rules.houseRuleOtherRules,
        },
        { method: "PATCH" },
      );
      router.back();
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  const renderBooleanRule = (rule: (typeof HOUSE_RULES_CONFIG)[number]) => {
    const value = rules?.[rule.field as keyof RulesState] as boolean | null;
    return (
      <View key={rule.id} style={styles.ruleItem}>
        <View style={styles.ruleRow}>
          <Ionicons
            name={rule.icon as keyof typeof Ionicons.glyphMap}
            size={RULE_ICON_SIZE}
            color={colors.iconDecorative}
            style={styles.ruleIcon}
          />
          <View style={styles.ruleContent}>
            <Text style={commonStyles.itemTitle}>{rule.title}</Text>
            {rule.description && (
              <Text style={[commonStyles.itemSubtext, styles.ruleDescription]}>
                {rule.description}
              </Text>
            )}
          </View>
          <Switch
            value={value ?? false}
            onValueChange={(v) =>
              updateRule(
                rule.field as keyof RulesState,
                v as RulesState[keyof RulesState],
              )
            }
            disabled={saving}
          />
        </View>
      </View>
    );
  };

  const renderDoubleTimeRule = (rule: (typeof HOUSE_RULES_CONFIG)[number]) => {
    const enabled = rules?.houseRuleQuietHoursEnabled ?? false;
    return (
      <View key={rule.id} style={styles.ruleItem}>
        <View style={styles.ruleRow}>
          <Ionicons
            name={rule.icon as keyof typeof Ionicons.glyphMap}
            size={RULE_ICON_SIZE}
            color={colors.iconDecorative}
            style={styles.ruleIcon}
          />
          <View style={styles.ruleContent}>
            <Text style={commonStyles.itemTitle}>{rule.title}</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={(v) => updateRule("houseRuleQuietHoursEnabled", v)}
            disabled={saving}
          />
        </View>
        {enabled && rules && (
          <View style={styles.timeRangeContainer}>
            <TimeRangePicker
              startTime={rules.houseRuleQuietHoursStart}
              endTime={rules.houseRuleQuietHoursEnd}
              onStartChange={(t) => updateRule("houseRuleQuietHoursStart", t)}
              onEndChange={(t) => updateRule("houseRuleQuietHoursEnd", t)}
            />
          </View>
        )}
      </View>
    );
  };

  const renderStringRule = (rule: (typeof HOUSE_RULES_CONFIG)[number]) => {
    const value = rules?.houseRuleOtherRules;
    return (
      <View key={rule.id}>
        <Pressable
          style={styles.ruleItem}
          onPress={() => setOtherRulesModalVisible(true)}
          disabled={saving}
        >
          <View style={styles.ruleRow}>
            <Ionicons
              name={rule.icon as keyof typeof Ionicons.glyphMap}
              size={22}
              color={colors.iconDecorative}
              style={styles.ruleIcon}
            />
            <View style={styles.ruleContent}>
              <Text style={commonStyles.itemTitle}>{rule.title}</Text>
              {rule.description && (
                <Text
                  style={[commonStyles.itemSubtext, styles.ruleDescription]}
                >
                  {rule.description}
                </Text>
              )}
              {value && (
                <Text style={commonStyles.itemSubtext} numberOfLines={2}>
                  {value}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.icon} />
          </View>
        </Pressable>
      </View>
    );
  };

  const renderRule = (rule: (typeof HOUSE_RULES_CONFIG)[number]) => {
    switch (rule.type) {
      case "boolean":
        return renderBooleanRule(rule);
      case "doubleTime":
        return renderDoubleTimeRule(rule);
      case "string":
        return renderStringRule(rule);
    }
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="House rules" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={commonStyles.sectionLoader} />
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={commonStyles.bodyText}>
              This will be emailed to the guests before they arrive so they are
              aware of your expectations.
            </Text>

            <View style={commonStyles.borderedRows}>
              {HOUSE_RULES_CONFIG.map((rule, index) => (
                <View key={rule.id}>
                  {index > 0 && (
                    <View style={commonStyles.borderedRowDivider} />
                  )}
                  {renderRule(rule)}
                </View>
              ))}
            </View>
          </ScrollView>

          <ActionBar
            onCancel={() => router.back()}
            onSave={handleSave}
            loading={saving}
            showDivider={false}
            containerStyle={commonStyles.footer}
          />
        </>
      )}

      <FormInputModal
        visible={otherRulesModalVisible}
        onDismiss={() => setOtherRulesModalVisible(false)}
        title="Other rules"
        subtext="Share anything else you expect from guests"
        value={rules?.houseRuleOtherRules ?? ""}
        onSave={(value) => {
          updateRule("houseRuleOtherRules", value || null);
          setOtherRulesModalVisible(false);
        }}
        onDelete={
          rules?.houseRuleOtherRules
            ? () => {
                updateRule("houseRuleOtherRules", null);
                setOtherRulesModalVisible(false);
              }
            : undefined
        }
        maxLength={1000}
        optional
      />

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  ruleItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  ruleIcon: {
    width: RULE_ICON_WIDTH,
  },
  ruleContent: {
    flex: 1,
    gap: spacing.xs,
  },
  ruleDescription: {
    maxWidth: "70%",
  },
  timeRangeContainer: {
    marginLeft: RULE_ICON_WIDTH + spacing.sm,
  },
});
