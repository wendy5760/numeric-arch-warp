# Figma Community Listing Draft

## Plugin name

Numeric Arch Warp

## Short tagline

Warp frames and images with reusable numeric arch settings.

## One-line description

Bend selected frames or images into consistent upward or downward arches, then reuse the exact same warp on replacement artwork.

## Full description

Numeric Arch Warp lets you create consistent raster arch warps directly inside Figma.

Select a frame, image, component instance, or visible layer, load it into the plugin, then adjust the bend with exact numeric controls. The plugin exports the selected object as a raster source, resamples the content into an arch, and places the warped result back into your file as a transparent PNG.

Use it for product cards, image covers, editorial layouts, social graphics, mockups, and any composition where the frame and its image need to bend together.

What makes it useful:

- Numeric bend controls instead of manual handle dragging.
- Reusable settings for consistent results across multiple images.
- Works with full frames, so borders, shadows, fills, and visible content bend together.
- Replacement workflow: select new artwork plus an existing warped result, then update with the same saved settings.
- Automatic raster fitting for large artwork, so oversized sources are reduced before Figma imports the generated PNG.
- Fully local processing. No uploads and no network access.

Important note: the generated warp is a raster result, not a live editable vector/frame deformation. Keep your original frame editable, then rerun the plugin whenever you need to update the warped output.

## Suggested category

Design tools

## Suggested tags

image, warp, arch, bend, raster, frame, mockup, layout, transform, reusable

## Suggested screenshots

1. Before/after: a flat frame becoming an upward arch.
2. Plugin UI showing the bend amount, curve shape, and sampling segments.
3. Replacement workflow: original warped result next to a new image using the same bend.
4. Close-up showing that the image content itself bends, not just the outer shape.

## Suggested thumbnail idea

A clean product-card image bending upward in the center, with small numeric labels like `22%`, `2.0`, and `256` beside it.

## Privacy note

Numeric Arch Warp runs locally in Figma. It does not upload user artwork, call external APIs, or request network access.

## Review checklist

- Test the plugin with one image node, one frame containing an image fill, and one frame with border/shadow.
- Confirm `Create copy` generates a transparent PNG result.
- Confirm selecting a new source plus an existing warp result enables `Update selected result`.
- Confirm the plugin works with Figma Desktop development import.
- Replace the manifest `id` with the ID assigned by Figma if publishing creates a new plugin ID.
- Add final screenshots and a thumbnail in the Figma Community publishing flow.
