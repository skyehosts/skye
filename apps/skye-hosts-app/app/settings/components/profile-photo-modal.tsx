import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { AppModal } from "../../components/app-modal";
import { AppSnackbar } from "../../components/app-snackbar";
import { fetchApi } from "../../services/api";
import { pickProfilePhoto } from "../../services/profile-photo-picker";
import { uploadProfilePhoto } from "../../services/profile-photo-upload";
import { colors, commonStyles, spacing } from "../../theme";
import { handleApiError } from "../../utils/form-error-handler";

interface ProfilePhotoModalProps {
  visible: boolean;
  currentPhotoUrl: string | null;
  onDismiss: () => void;
  onPhotoChanged: (photoUrl: string | null) => void;
}

export function ProfilePhotoModal({
  visible,
  currentPhotoUrl,
  onDismiss,
  onPhotoChanged,
}: ProfilePhotoModalProps) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleChoosePhoto() {
    const picked = await pickProfilePhoto();
    if (!picked) return;

    setLoading(true);
    setServerError("");
    try {
      const photoUrl = await uploadProfilePhoto(picked.uri);
      onPhotoChanged(photoUrl);
      onDismiss();
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemovePhoto() {
    setLoading(true);
    setServerError("");
    try {
      await fetchApi<undefined>("/account/profile-photo", undefined, {
        method: "DELETE",
      });
      onPhotoChanged(null);
      onDismiss();
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppModal visible={visible} onDismiss={onDismiss}>
      <Text style={commonStyles.modalTitle}>Profile photo</Text>

      <View style={styles.photoContainer}>
        {currentPhotoUrl ? (
          <Image source={{ uri: currentPhotoUrl }} style={styles.photo} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons
              name="person-outline"
              size={48}
              color={colors.iconDecorative}
            />
          </View>
        )}
      </View>

      <Button
        mode="contained"
        onPress={handleChoosePhoto}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        {currentPhotoUrl ? "Change photo" : "Choose photo"}
      </Button>

      {currentPhotoUrl && (
        <Button
          mode="outlined"
          onPress={handleRemovePhoto}
          disabled={loading}
          style={styles.button}
        >
          Remove photo
        </Button>
      )}

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </AppModal>
  );
}

const styles = StyleSheet.create({
  photoContainer: {
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.inputBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginTop: spacing.sm,
  },
});
