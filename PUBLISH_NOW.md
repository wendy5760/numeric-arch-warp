# Publish Numeric Arch Warp

Use this as the final publishing checklist.

## Final files

- Development manifest: `manifest.json`
- Source files: `code.js`, `ui.html`
- GitHub README: `README.md`
- Chinese README: `README.zh-CN.md`
- Figma Community listing copy: `FIGMA_COMMUNITY.md`
- Release notes: `GITHUB_PUBLISHING.md`
- Fixed release package: `outputs/numeric-arch-warp-figma-plugin-en-fixed.zip`

## Figma Community

1. Open Figma Desktop.
2. Import the plugin from `manifest.json` if it is not already imported.
3. Test it in a design file with:
   - One image node.
   - One frame with an image fill.
   - One frame with image, border, and shadow.
   - One large image that previously showed `Image is too large`.
4. Create final screenshots:
   - Before/after arch warp.
   - Plugin UI with numeric controls.
   - Replacement workflow using the same warp settings.
   - Close-up showing the content itself is warped.
5. Go to `https://www.figma.com/developers/apps`.
6. Create or select the plugin.
7. Use this name:

```text
Numeric Arch Warp
```

8. Use this tagline:

```text
Warp frames and images with reusable numeric arch settings.
```

9. Use the full description from `FIGMA_COMMUNITY.md`.
10. Use these tags:

```text
image, warp, arch, bend, raster, frame, mockup, layout, transform, reusable
```

11. Use this privacy note:

```text
Numeric Arch Warp runs locally in Figma. It does not upload user artwork, call external APIs, or request network access.
```

12. Submit for review.
13. If Figma assigns a new plugin ID, copy that ID back into `manifest.json`.

## GitHub

1. Create a new GitHub repository named:

```text
numeric-arch-warp
```

2. Use this repository description:

```text
Figma plugin for numeric raster arch warping of frames and images.
```

3. Use these topics:

```text
figma-plugin, figma, image-warp, raster, design-tools, plugin, canvas
```

4. Upload or commit these files:

```text
manifest.json
code.js
ui.html
README.md
README.zh-CN.md
FIGMA_COMMUNITY.md
GITHUB_PUBLISHING.md
LICENSE
.gitignore
```

5. Create the first release:

```text
v0.1.0
```

6. Use this release title:

```text
Numeric Arch Warp v0.1.0
```

7. Use the release notes from `GITHUB_PUBLISHING.md`.
8. Attach `outputs/numeric-arch-warp-figma-plugin-en-fixed.zip` to the release.
9. After the Figma Community page is live, add its URL to `README.md`.
