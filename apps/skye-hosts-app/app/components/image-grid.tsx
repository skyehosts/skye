import type { IListingImageDto } from "../../../../packages/skye-hosts-api-client/src";
import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import DraggableFlatList, {
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import type { ImageUploadStatus, LocalImage } from "../services/image-upload";
import {
  borderRadius,
  colors,
  fontWeight,
  spacing,
  typography,
} from "../theme";

const NUM_COLUMNS = 3;
const GRID_GAP = spacing.sm;

interface ImageGridProps {
  remoteImages: IListingImageDto[];
  localImages: LocalImage[];
  processingImageIds: Set<string>;
  canAddMore: boolean;
  onAddMore: () => void;
  onRemoveLocal: (index: number) => void;
  onRemoveRemote: (imageId: string) => void;
  onReorder: (imageIds: string[]) => void;
  onPreview?: (image: IListingImageDto) => void;
}

type GridItem =
  | { type: "remote"; image: IListingImageDto }
  | { type: "local"; image: LocalImage; localIndex: number }
  | { type: "add" };

function getItemKey(item: GridItem): string {
  if (item.type === "remote") return `remote-${item.image.id}`;
  if (item.type === "local") return `local-${item.localIndex}`;
  return "add-more";
}

function getStatusLabel(status: ImageUploadStatus): string | null {
  switch (status) {
    case "compressing":
      return "Compressing...";
    case "uploading":
      return "Uploading...";
    case "confirming":
      return "Processing...";
    case "error":
      return "Failed";
    default:
      return null;
  }
}

function RemoveButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.removeButton} onPress={onPress}>
      <Ionicons name="close-circle" size={22} color={colors.danger} />
    </Pressable>
  );
}

function StatusOverlay({ status }: { status: ImageUploadStatus }) {
  const label = getStatusLabel(status);
  if (!label) return null;

  const isError = status === "error";
  const isActive =
    status === "compressing" ||
    status === "uploading" ||
    status === "confirming";

  return (
    <View style={[styles.statusOverlay, isError && styles.statusOverlayError]}>
      {isActive && <ActivityIndicator size="small" color={colors.background} />}
      {isError && (
        <Ionicons name="alert-circle" size={18} color={colors.background} />
      )}
      <Text style={styles.statusText}>{label}</Text>
    </View>
  );
}

export function ImageGrid({
  remoteImages,
  localImages,
  processingImageIds,
  canAddMore,
  onAddMore,
  onRemoveLocal,
  onRemoveRemote,
  onReorder,
  onPreview,
}: ImageGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const tileSize =
    (screenWidth - spacing.md * 2 - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  const data: GridItem[] = [
    ...remoteImages.map((image): GridItem => ({ type: "remote", image })),
    ...localImages.map(
      (image, i): GridItem => ({ type: "local", image, localIndex: i }),
    ),
    ...(canAddMore ? [{ type: "add" as const }] : []),
  ];

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<GridItem>) => {
      const tileStyle = [
        styles.tile,
        { width: tileSize, height: tileSize },
        isActive && styles.tileActive,
      ];

      if (item.type === "add") {
        return (
          <Pressable style={[tileStyle, styles.addTile]} onPress={onAddMore}>
            <Ionicons name="add" size={32} color={colors.icon} />
            <Text style={styles.addText}>Add photos</Text>
          </Pressable>
        );
      }

      if (item.type === "local") {
        return (
          <View style={tileStyle}>
            <Image source={{ uri: item.image.localUri }} style={styles.image} />
            <StatusOverlay status={item.image.status} />
            {item.image.status === "pending" && (
              <RemoveButton onPress={() => onRemoveLocal(item.localIndex)} />
            )}
          </View>
        );
      }

      // Remote image — draggable for reorder
      const isProcessing = processingImageIds.has(item.image.id);
      const thumbnailUrl = isProcessing
        ? item.image.originalUrl
        : (item.image.urls.find((u) => u.width === 640)?.url ??
          item.image.urls[0]?.url);

      return (
        <Pressable
          style={tileStyle}
          onLongPress={drag}
          onPress={() => onPreview?.(item.image)}
          disabled={isActive}
        >
          <Image source={{ uri: thumbnailUrl }} style={styles.image} />
          {isProcessing && <StatusOverlay status="confirming" />}
          <RemoveButton onPress={() => onRemoveRemote(item.image.id)} />
        </Pressable>
      );
    },
    [
      tileSize,
      onAddMore,
      onRemoveLocal,
      onRemoveRemote,
      onPreview,
      processingImageIds,
    ],
  );

  const handleDragEnd = useCallback(
    ({ data: reordered }: { data: GridItem[] }) => {
      const remoteIds = reordered
        .filter(
          (item): item is GridItem & { type: "remote" } =>
            item.type === "remote",
        )
        .map((item) => item.image.id);

      if (remoteIds.length > 0) {
        onReorder(remoteIds);
      }
    },
    [onReorder],
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <DraggableFlatList
        data={data}
        keyExtractor={getItemKey}
        renderItem={renderItem}
        onDragEnd={handleDragEnd}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        scrollEnabled={false}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    gap: GRID_GAP,
  },
  row: {
    gap: GRID_GAP,
  },
  tile: {
    borderRadius: borderRadius.sm,
    overflow: "hidden",
    backgroundColor: colors.placeholder,
  },
  tileActive: {
    opacity: 0.8,
    transform: [{ scale: 1.05 }],
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  addTile: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  addText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  removeButton: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: 11,
  },
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  statusOverlayError: {
    backgroundColor: "rgba(255,59,48,0.6)",
  },
  statusText: {
    color: colors.background,
    fontSize: typography.sm,
    fontWeight: fontWeight.semibold,
  },
});
