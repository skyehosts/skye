# Image Pipeline - Environment Variables

## CDK Deploy (aws-infrastructure)

These are needed when deploying the `ListingImagePipelineStack`:

- `IMAGE_PROCESSOR_SENTRY_DSN` — Sentry DSN for the image processor Lambda
- `SQS_FORWARDER_SENTRY_DSN_LAYER_ARN` — (already exists, shared with other Lambdas)

## API (skye-hosts-api)

Add these to your `.env.local` / `.env` / deployment config:

- `AWS_S3_IMAGES_BUCKET` — S3 bucket name (e.g. `skye-hosts-images-qa`)
- `AWS_CLOUDFRONT_IMAGES_DOMAIN` — CloudFront distribution domain (e.g. `d1234abcdef.cloudfront.net`)
- `AWS_SQS_ENVIRONMENT` — (already exists, used for queue name resolution)

## After deploying CDK

1. Run `cdk deploy --context env=qa` (or production) to create the stack
2. Note the CloudFormation outputs for bucket name and CDN domain
3. Set those values in the API environment variables above

## Migration

Run the TypeORM migration after the API code is deployed:

```bash
pnpm --filter=skye-hosts-api migration:generate src/migrations/AddListingImage
pnpm --filter=skye-hosts-api migration:run
```
