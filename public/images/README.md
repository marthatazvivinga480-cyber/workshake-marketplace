# WorkShake image workflow

Put original JPG/PNG files in `public/images/source/`, then run:

```bash
npm run images:optimize
```

Optimized WebP and AVIF versions are written to `public/images/optimized/`. Use responsive `<picture>` markup and meaningful alt text when replacing the current visual placeholders.
