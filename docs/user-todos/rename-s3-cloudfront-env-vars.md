# Update env vars in all non-local environments

Two env vars were renamed to reflect their multi-purpose use (listing images + profile photos):

| Old name                               | New name                       |
| -------------------------------------- | ------------------------------ |
| `AWS_S3_LISTING_IMAGES_BUCKET`         | `AWS_S3_IMAGES_BUCKET`         |
| `AWS_CLOUDFRONT_LISTING_IMAGES_DOMAIN` | `AWS_CLOUDFRONT_IMAGES_DOMAIN` |

The values are unchanged — only the names differ.

## Environments to update

- [ ] QA / staging environment variables
- [ ] Production environment variables
- [ ] Any CI/CD pipelines (GitHub Actions secrets, etc.) that inject these vars
- [ ] Any other `.env.*` files not tracked in git (e.g. `.env.e2e`)
