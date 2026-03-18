# AWS Image Pipeline --- Technical Specification

## Scope

This document defines the agreed architecture and implementation
requirements for a cost‑optimized, SEO‑focused image upload, processing,
storage, and delivery pipeline using AWS services and Next.js.

This specification is implementation‑ready and intentionally avoids
assumptions about existing application structure or infrastructure
provisioning workflows.

---

# 1. Objectives

## Primary Goals

- Excellent SEO and Core Web Vitals
- Mobile‑first performance
- Low long‑term operating cost
- High scalability
- Predictable performance
- Standards‑based responsive image delivery

## Constraints

- Users upload listing photos via the react native (hosts app)
- Each listing supports up to 20 photos
- Images viewed on desktop and mobile devices
- Next.js `<Image />` component used for delivery
- AWS‑native storage and delivery
- Image optimization performed ahead of delivery (no runtime
  transforms)

---

# 2. High‑Level Architecture

## Upload Flow

1.  Client requests signed upload URL
2.  Signed URL returned by backend
3.  Client uploads directly to object storage
4.  Upload completion recorded in application database

### Requirements

- Uploads must bypass application servers
- Signed URLs must be time‑limited
- Upload must use secure HTTPS

---

## Storage & Delivery Flow

1.  Original image stored
2.  Upload event triggers async processing
3.  Optimized variants generated
4.  Variants stored
5.  CDN serves optimized variants
6.  Frontend renders images via CDN URLs

---

# 3. Image Storage Design

## Object Key Structure

    /listings/{listingId}/original/{imageId}.jpg
    /listings/{listingId}/derived/{width}w/{imageId}.webp

### Requirements

- Originals stored separately from derived assets
- Deterministic, hierarchical paths
- Unique image identifiers
- Listing‑scoped directories

---

# 4. Image Processing Pipeline

## Processing Model

- Asynchronous pipeline
- Processing triggered automatically after upload
- Users do not wait for processing completion

## Processing Steps

1.  Download original
2.  Strip metadata (EXIF removal required)
3.  Resize to configured widths
4.  Compress to configured quality
5.  Convert to modern format
6.  Store derived variants

---

# 5. Image Variant Specification

## Responsive Widths (Required)

Generate the following widths: - 320px - 640px - 960px - 1280px - 1920px

## Output Format

- Primary format: WebP
- JPEG fallback: Not required initially
- AVIF: Not required initially

## Compression Quality

- Target quality: 80

## Transparency Handling

- Transparency must be preserved
- Do not generate formats that drop alpha channels

---

# 6. Upload Constraints

## File Types Accepted

- JPEG
- PNG
- HEIC

## File Types Rejected

- GIF
- RAW camera formats
- Unsupported image formats

## Size Limits

- Maximum file size: 10 MB
- Maximum image width: 2560 px
- Images exceeding limits must be downscaled before or during
  processing

## Client‑Side Requirements

- Pre‑upload compression required
- Pre‑upload resize required

---

# 7. Metadata Policy

- All EXIF and metadata must be stripped
- No GPS or camera data retained

---

# 8. CDN & Caching Strategy

## Delivery

- Images delivered via CDN
- CDN must sit in front of storage origin

## Cache Headers

    Cache-Control: public, max-age=31536000, immutable

## URL Immutability

- Derived image URLs must be immutable
- If image replaced, filename version must change

### Versioning Example

    {imageId}_v2.webp

---

# 9. Access Control

- Images are public
- No signed delivery URLs required
- No authenticated proxying required

---

# 10. Lifecycle & Cost Controls

## Storage Tiering

- 0--90 days: Standard tier
- 90+ days: Intelligent tiering
- 1+ year: Archive tier

## Cleanup Rules

- Deleting a listing must delete all associated images
- Prevent orphaned storage

---

# 11. Next.js Image Delivery

## Rendering Component

- Use Next.js `<Image />` component

## Behavior Requirements

- Responsive image sizing
- Lazy loading below the fold
- Priority loading for above‑the‑fold hero images
- Proper width/height attributes required
- Use `sizes` attribute for responsive selection

---

# 12. Performance Requirements

## Mobile Optimization

- Minimize transferred bytes
- Serve appropriately sized images
- Avoid layout shift

## Bandwidth Reduction

- Pre‑resized images required
- Modern formats required
- CDN caching required

---

# 13. Processing Characteristics

## Execution Model

- Event‑driven
- Horizontally scalable
- Idempotent processing

## Deterministic Output Naming

Example:

    {width}w_q80.webp

Prevents duplicate processing and improves cacheability.

---

# 14. Explicit Non‑Goals (Out of Scope)

The following are intentionally excluded: - Watermarking - AI
moderation - Smart cropping - Advanced art‑direction crops - Animated
image handling - Private image delivery - AVIF generation - JPEG
fallback generation

---

# 15. Summary of Decisions

## Variants

- 5 responsive widths
- WebP format
- Quality 80

## Uploads

- Direct‑to‑storage signed uploads
- 10MB max size
- 2560px max width
- Client‑side compression
- Strip metadata

## Processing

- Async event‑driven pipeline
- Pre‑generate all variants

## Delivery

- CDN distribution
- Immutable caching
- Public assets
- Versioned filenames

## Cost Controls

- Tiered storage lifecycle
- Aggressive caching
- Cleanup on deletion

---

End of specification.
