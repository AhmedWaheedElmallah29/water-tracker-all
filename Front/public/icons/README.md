# Icon Generation Instructions

Since automated resizing isn't available in this environment, follow these steps to generate all required PWA icons.

## Option A — Use an Online Tool (Easiest)

1. Go to **https://realfavicongenerator.net** or **https://www.pwabuilder.com/imageGenerator**
2. Upload the file: `Front/public/water-bottle.png`
3. Download the generated icon pack
4. Copy the following files into `Front/public/icons/`:

| File Name | Size |
|-----------|------|
| `pwa-192x192.png` | 192×192 px |
| `pwa-512x512.png` | 512×512 px |
| `apple-touch-icon.png` | 180×180 px |
| `favicon-32x32.png` | 32×32 px |
| `favicon-16x16.png` | 16×16 px |

## Option B — Use sharp CLI (Node.js)

Run this in your terminal from the `Front/` directory:

```bash
npm install -g sharp-cli
sharp -i public/water-bottle.png -o public/icons/pwa-192x192.png resize 192 192
sharp -i public/water-bottle.png -o public/icons/pwa-512x512.png resize 512 512
sharp -i public/water-bottle.png -o public/icons/apple-touch-icon.png resize 180 180
sharp -i public/water-bottle.png -o public/icons/favicon-32x32.png resize 32 32
sharp -i public/water-bottle.png -o public/icons/favicon-16x16.png resize 16 16
```

## Option C — Use ImageMagick (if installed)

```bash
cd Front/public
mkdir icons
magick water-bottle.png -resize 192x192 icons/pwa-192x192.png
magick water-bottle.png -resize 512x512 icons/pwa-512x512.png
magick water-bottle.png -resize 180x180 icons/apple-touch-icon.png
magick water-bottle.png -resize 32x32  icons/favicon-32x32.png
magick water-bottle.png -resize 16x16  icons/favicon-16x16.png
```
