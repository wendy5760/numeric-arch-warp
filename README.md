# Numeric Arch Warp

Numeric Arch Warp is a Figma plugin that bends selected frames, images, component instances, or visible layers into a reusable numeric arch.

Instead of dragging handles by eye, you control the warp with exact values. Use the same bend settings across multiple images, covers, cards, mockups, or framed compositions.

## What it does

- Warps the visual content of a selected frame or image into an upward or downward arch.
- Works on an entire frame, so the frame, image fill, border, shadow, and visible contents bend together.
- Saves the numeric warp settings on the generated result.
- Lets you replace the source image later and reapply the same warp amount.
- Automatically downscales oversized raster outputs so Figma can place the result without an "Image is too large" error.
- Runs locally inside Figma and does not access external network resources.

## Install for development

1. Open Figma Desktop.
2. Go to `Plugins > Development > Import plugin from manifest...`.
3. Select `manifest.json` from this folder.
4. Select a frame or image in a Figma design file.
5. Run `Numeric Arch Warp`.

## Basic workflow

1. Select a frame or image.
2. Click `Load selection`.
3. Adjust `Bend amount`, `Curve shape`, and `Sampling segments`.
4. Click `Create copy`.

If you want a frame and its image to bend together, select the outer frame. The plugin exports the selected object as a raster source, resamples it into the arch shape, and places the warped PNG back into the file.

## Replace artwork with the same warp

1. Select the new image or frame.
2. Also select the previous warped result.
3. Click `Load selection`.
4. Click `Update selected result`.

The plugin reads the saved settings from the existing result and applies the same numeric warp to the new source.

## Controls

- `Bend amount (%)`: Positive values bend upward. Negative values bend downward.
- `Curve shape`: `2` is a classic parabolic curve. Higher values keep the center flatter and concentrate the bend near the sides.
- `Sampling segments`: Higher values create a smoother result. Try `512` or `1024` for large images.
- `Export scale`: Controls the raster quality used for the source. `2x` is a good default; use `3x` or `4x` for final artwork. Oversized sources are automatically fit to a safe raster size before being sent back to Figma.

## Important limitation

Figma's plugin API cannot create a truly live, editable native frame whose internal layers are continuously warped. This plugin creates a transparent PNG result and stores the warp settings as plugin data.

Keep your original source frame editable. When you need a new image, run the plugin again to update the warped result with the same settings.

For very large source images or frames, the plugin may show `auto-fit` in the UI. The final layer keeps the same design dimensions in Figma, but the internal PNG resolution is reduced to stay within Figma's image limits.

## Repository structure

- `manifest.json`: Figma plugin manifest.
- `code.js`: Figma plugin controller code.
- `ui.html`: Plugin UI and raster warp renderer.
- `README.zh-CN.md`: Chinese documentation.
- `FIGMA_COMMUNITY.md`: Suggested English listing copy and publishing checklist.

## Privacy

Numeric Arch Warp processes selected layers locally inside Figma. It does not upload artwork, call external APIs, or request network access.

## License

MIT
