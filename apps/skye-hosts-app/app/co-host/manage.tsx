import type {
  ICoHostInviteDto,
  IGetCoHostInvitesResponseDto,
  IGetListingCoHostsResponseDto,
  IListingCoHostDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Appbar, Button, Chip, Text } from "react-native-paper";
import { DangerButton } from "../components/danger-button";
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

const CO_HOST_ROLE_LABELS: Record<string, string> = {
  full_access: "Full Access",
  calendar_and_messaging: "Calendar & Messaging",
  calendar_only: "Calendar Only",
};

const INVITE_STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  accepted: colors.success,
  revoked: colors.danger,
  expired: colors.textSecondary,
};

export default function ManageCoHostsScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const [coHosts, setCoHosts] = useState<IListingCoHostDto[]>([]);
  const [invites, setInvites] = useState<ICoHostInviteDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [coHostData, inviteData] = await Promise.all([
        fetchApi<IGetListingCoHostsResponseDto>(
          `/co-host-invite/co-hosts/${listingId}`,
        ),
        fetchApi<IGetCoHostInvitesResponseDto>(
          `/co-host-invite/listing/${listingId}`,
        ),
      ]);
      setCoHosts(coHostData.coHosts);
      setInvites(inviteData.invites);
    } catch {
      setError("Failed to load co-host data");
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRemoveCoHost = (coHost: IListingCoHostDto) => {
    Alert.alert(
      "Remove Co-Host",
      `Remove ${coHost.accountName} from this listing?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await fetchApi(`/co-host-invite/role/${coHost.id}`, undefined, {
                method: "DELETE",
              });
              await loadData();
            } catch {
              Alert.alert("Error", "Failed to remove co-host");
            }
          },
        },
      ],
    );
  };

  const onRevokeInvite = (invite: ICoHostInviteDto) => {
    Alert.alert(
      "Revoke Invite",
      `Revoke the invite to ${invite.inviteeEmail}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: async () => {
            try {
              await fetchApi("/co-host-invite/revoke", {
                inviteId: invite.id,
              });
              await loadData();
            } catch {
              Alert.alert("Error", "Failed to revoke invite");
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Co-Hosts" />
        <Appbar.Action
          icon="plus"
          onPress={() =>
            router.push({
              pathname: "/co-host/invite-create",
              params: { listingId },
            })
          }
        />
      </Appbar.Header>

      {isLoading && (
        <View style={commonStyles.centered}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {error && (
        <View style={commonStyles.centered}>
          <Text style={commonStyles.errorText}>{error}</Text>
          <Button mode="outlined" onPress={loadData}>
            Retry
          </Button>
        </View>
      )}

      {!isLoading && !error && (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Active Co-Hosts */}
          <View style={styles.section}>
            <Text style={commonStyles.sectionTitle}>Active Co-Hosts</Text>
            {coHosts.length === 0 ? (
              <Text style={commonStyles.bodyText}>No co-hosts yet</Text>
            ) : (
              coHosts.map((coHost) => (
                <View key={coHost.id} style={styles.personCard}>
                  <View style={commonStyles.flex}>
                    <Text style={styles.personName}>{coHost.accountName}</Text>
                    <Text style={styles.personEmail}>
                      {coHost.accountEmail}
                    </Text>
                    <Chip
                      style={styles.roleChip}
                      textStyle={styles.roleChipText}
                    >
                      {CO_HOST_ROLE_LABELS[coHost.role] ?? coHost.role}
                    </Chip>
                  </View>
                  <DangerButton
                    variant="secondary"
                    onPress={() => onRemoveCoHost(coHost)}
                    compact
                  >
                    Remove
                  </DangerButton>
                </View>
              ))
            )}
          </View>

          <View style={commonStyles.divider} />

          {/* Pending Invites */}
          <View style={styles.section}>
            <Text style={commonStyles.sectionTitle}>Invites</Text>
            {invites.length === 0 ? (
              <Text style={commonStyles.bodyText}>No invites sent</Text>
            ) : (
              invites.map((invite) => (
                <View key={invite.id} style={styles.personCard}>
                  <View style={commonStyles.flex}>
                    <Text style={styles.personEmail}>
                      {invite.inviteeEmail}
                    </Text>
                    <View style={styles.chipRow}>
                      <Chip
                        style={styles.roleChip}
                        textStyle={styles.roleChipText}
                      >
                        {CO_HOST_ROLE_LABELS[invite.role] ?? invite.role}
                      </Chip>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              INVITE_STATUS_COLORS[invite.status] ??
                              colors.textSecondary,
                          },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {invite.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {invite.status === "pending" && (
                    <DangerButton
                      variant="secondary"
                      onPress={() => onRevokeInvite(invite)}
                      compact
                    >
                      Revoke
                    </DangerButton>
                  )}
                </View>
              ))
            )}
          </View>

          <Button
            mode="contained"
            onPress={() =>
              router.push({
                pathname: "/co-host/invite-create",
                params: { listingId },
              })
            }
            icon="plus"
            style={styles.inviteButton}
          >
            Invite Co-Host
          </Button>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  personName: {
    fontSize: typography.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  personEmail: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  chipRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  roleChip: {
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  roleChipText: {
    fontSize: typography.sm,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: typography.sm,
    color: colors.background,
    fontWeight: fontWeight.medium,
    textTransform: "capitalize",
  },
  inviteButton: {
    marginTop: spacing.md,
  },
});
