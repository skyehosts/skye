# Image Display Strategy

No server-side cropping. All display-time fitting is done via CSS `object-fit: cover` (web) / RN `resizeMode: "cover"` (native) with centered positioning (default).

## Validation Guardrails

All uploaded images are validated to fall within **3:4 (portrait)** to **16:9 (landscape)** aspect ratio. This bounds the worst-case crop from `cover` mode to acceptable levels.

## Per-Journey Specifications

### Guest Listings Page — Cover Image (1:1)

```css
aspect-ratio: 1/1;
object-fit: cover;
object-position: center;
```

### Guest Listing Page — Hero Grid

Primary image:

```css
aspect-ratio: 1.31/1;
object-fit: cover;
object-position: center;
```

Secondary images:

```css
aspect-ratio: 1.24/1;
object-fit: cover;
object-position: center;
```

### Guest Lightbox / Modal (Full Preview)

```css
object-fit: contain;
max-width: 90vw;
max-height: 90vh;
```

Preserves original aspect ratio within viewport bounds.

## Responsive Image Strategy

Use Next.js `<Image>` component with `sizes` prop and the derived widths for automatic resolution selection:

```html
<Image
  src={urls[1920]}
  srcSet="...320w.webp 320w, ...640w.webp 640w, ...960w.webp 960w, ...1280w.webp 1280w, ...1920w.webp 1920w"
  sizes="(max-width: 768px) 100vw, 800px"
  style={{ aspectRatio: '1.31/1', objectFit: 'cover' }}
/>
```

## Derived Sizes

Current derived widths: `[320, 640, 960, 1280, 1920]`

These cover all display contexts adequately, including 2x retina and worst-case aspect ratio mismatch within the 3:4–16:9 guardrails. No Lambda changes needed.

## Quality Notes

With the 3:4–16:9 guardrails and current derived sizes, no image will be upscaled more than ~1.78x in the worst case (a 16:9 image in a 1:1 container). This is within acceptable quality bounds at WebP quality 80.
