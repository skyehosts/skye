import type { SQSEvent, SQSHandler } from "aws-lambda";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

// @sentry/aws-serverless is provided via the Lambda layer and marked as
// external in the esbuild config, so it resolves from /opt/nodejs at runtime.

const Sentry = process.env["SENTRY_DSN"]
  ? (() => {
      const s = require("@sentry/aws-serverless");
      s.init({
        dsn: process.env["SENTRY_DSN"],
        environment: process.env["NODE_ENV"],
        tracesSampleRate: 1.0,
      });
      return s;
    })()
  : null;

const BUCKET_NAME = process.env["BUCKET_NAME"]!;
const DERIVED_WIDTHS = [320, 640, 960, 1280, 1920] as const;

const s3 = new S3Client({});

interface ListingImageProcessingMessage {
  imageId: string;
  listingId: string;
  originalKey: string;
}

const rawHandler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const messageId = record.messageId;

    console.log(`Processing message ${messageId}`);

    let message: ListingImageProcessingMessage;
    try {
      message = JSON.parse(record.body) as ListingImageProcessingMessage;
    } catch (err) {
      console.error(`Failed to parse message ${messageId}:`, err);
      throw new Error(`Failed to parse message ${messageId}`);
    }

    const { imageId, listingId, originalKey } = message;

    console.log(
      `Downloading original image: ${originalKey} for listing ${listingId}`,
    );

    // Download the original image from S3.
    const getResult = await s3.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: originalKey,
      }),
    );

    const originalBuffer = Buffer.from(
      await getResult.Body!.transformToByteArray(),
    );

    // Get original image metadata to avoid upscaling.
    const metadata = await sharp(originalBuffer).metadata();
    const originalWidth = metadata.width ?? Infinity;

    // Generate derived variants for each target width.
    for (const width of DERIVED_WIDTHS) {
      // Skip widths larger than the original — don't upscale.
      if (width > originalWidth) {
        console.log(
          `Skipping ${width}w — original is only ${originalWidth}px wide`,
        );
        continue;
      }

      const derivedKey = `listings/${listingId}/derived/${width}w/${imageId}.webp`;

      console.log(`Generating ${derivedKey}`);

      const webpBuffer = await sharp(originalBuffer)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: derivedKey,
          Body: webpBuffer,
          ContentType: "image/webp",
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );

      console.log(`Uploaded ${derivedKey} (${webpBuffer.length} bytes)`);
    }

    console.log(`Message ${messageId} processed successfully`);
  }
};

export const handler = Sentry ? Sentry.wrapHandler(rawHandler) : rawHandler;
