import type { IListingImageDto } from "../../../../packages/skye-hosts-api-client/src";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar, Button } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { InfoBox } from "../components/info-box";
import { ImageGrid } from "../components/image-grid";
import { ScreenContainer } from "../components/screen-container";
import { useListingImages } from "../hooks/use-listing-images";
import { colors, commonStyles, spacing, typography } from "../theme";

const MIN_PHOTOS = 5;
const MAX_PHOTOS = 20;

export default function EditPhotosScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [successMessage, setSuccessMessage] = useState("");
  const [previewImage, setPreviewImage] = useState<IListingImageDto | null>(
    null,
  );
  const waitingForProcessing = useRef(false);

  const {
    remoteImages,
    localImages,
    loading,
    uploading,
    error,
    totalCount,
    canAddMore,
    pickImages,
    removeLocal,
    removeRemote,
    uploadAll,
    reorder,
    clearError,
    processingImageIds,
  } = useListingImages(id);

  const pendingCount = localImages.filter(
    (img) => img.status === "pending",
  ).length;

  const handleRemoveRemote = (imageId: string) => {
    Alert.alert("Delete photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeRemote(imageId),
      },
    ]);
  };

  useEffect(() => {
    if (waitingForProcessing.current && processingImageIds.size === 0) {
      waitingForProcessing.current = false;
      setSuccessMessage("Photos uploaded successfully");
    }
  }, [processingImageIds]);

  const handleUpload = async () => {
    const allSucceeded = await uploadAll();
    if (allSucceeded) {
      waitingForProcessing.current = true;
    }
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit photos" />
      </Appbar.Header>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={commonStyles.subheading}>
          You need at least {MIN_PHOTOS} photos. You can add up to {MAX_PHOTOS}.
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : (
          <>
            <ImageGrid
              remoteImages={remoteImages}
              localImages={localImages}
              processingImageIds={processingImageIds}
              canAddMore={canAddMore}
              onAddMore={pickImages}
              onRemoveLocal={removeLocal}
              onRemoveRemote={handleRemoveRemote}
              onReorder={reorder}
              onPreview={setPreviewImage}
            />

            {totalCount > 0 && (
              <Text style={styles.countText}>
                {totalCount} / {MAX_PHOTOS} photos
              </Text>
            )}

            <InfoBox variant="info" icon="gesture-swipe">
              Long press and drag to reorder. The first photo is your cover
              image, and the first 5 are featured on your listing page.
            </InfoBox>
          </>
        )}
      </ScrollView>

      {pendingCount > 0 && (
        <View style={commonStyles.footer}>
          <Button
            mode="contained"
            onPress={handleUpload}
            loading={uploading}
            disabled={uploading}
          >
            Upload {pendingCount} photo{pendingCount !== 1 ? "s" : ""}
          </Button>
        </View>
      )}

      <Modal
        visible={previewImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <Pressable
          style={styles.previewBackdrop}
          onPress={() => setPreviewImage(null)}
        >
          {previewImage && (
            <Image
              source={{
                uri:
                  previewImage.urls.find((u) => u.width === 1280)?.url ??
                  previewImage.urls.find((u) => u.width === 1920)?.url ??
                  previewImage.originalUrl,
              }}
              style={styles.previewImage}
            />
          )}
          <Pressable
            style={styles.previewClose}
            onPress={() => setPreviewImage(null)}
          >
            <Ionicons name="close-circle" size={32} color={colors.background} />
          </Pressable>
        </Pressable>
      </Modal>

      <AppSnackbar message={error} onDismiss={clearError} />
      <AppSnackbar
        message={successMessage}
        onDismiss={() => setSuccessMessage("")}
        type="success"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  loader: {
    marginTop: spacing.xl,
  },
  countText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "90%",
    height: "80%",
    resizeMode: "contain",
  },
  previewClose: {
    position: "absolute",
    top: spacing.xl,
    right: spacing.md,
  },
});
