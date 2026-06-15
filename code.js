var PRESET_KEY = "numericArchWarpPreset";
var MARKER_KEY = "numericArchWarpOutput";
var STORAGE_KEY = "numericArchWarpLastParams";
var MAX_RASTER_EDGE = 4096;
var MAX_RASTER_PIXELS = 12000000;
var MIN_EXPORT_SCALE = 0.01;

var cachedSource = null;
var cachedTargetId = null;

figma.showUI(__html__, {
  width: 380,
  height: 640,
  themeColors: true
});

initialize();

figma.on("selectionchange", function () {
  postSelectionSummary();
});

figma.ui.onmessage = async function (message) {
  try {
    if (message.type === "load-selection") {
      await loadSelection(message.scale || 2);
      return;
    }

    if (message.type === "create-warp") {
      await createWarpNode(message);
      return;
    }

    if (message.type === "update-warp") {
      await updateWarpNode(message);
      return;
    }

    if (message.type === "close") {
      figma.closePlugin();
    }
  } catch (error) {
    var text = error && error.message ? error.message : String(error);
    figma.notify(text);
    figma.ui.postMessage({ type: "error", message: text });
  }
};

async function initialize() {
  var lastParams = await figma.clientStorage.getAsync(STORAGE_KEY);
  figma.ui.postMessage({
    type: "ready",
    lastParams: lastParams || null
  });
  postSelectionSummary();
}

async function loadSelection(scale) {
  var selection = figma.currentPage.selection;
  if (!selection.length) {
    throw new Error("Select a frame, image, or a new source object together with an existing warp result.");
  }

  var target = findWarpTarget(selection);
  cachedTargetId = target ? target.id : null;

  if (target) {
    var preset = readPreset(target);
    figma.ui.postMessage({
      type: "preset-loaded",
      preset: preset,
      targetName: target.name
    });
  } else {
    figma.ui.postMessage({ type: "target-cleared" });
  }

  var source = findWarpSource(selection, target);
  if (!source) {
    cachedSource = null;
    figma.ui.postMessage({
      type: "source-missing",
      message: "Warp settings loaded. To replace the artwork, select a new frame/image together with this warp result."
    });
    return;
  }

  if (typeof source.exportAsync !== "function") {
    throw new Error("The current selection cannot be exported as an image. Select a frame, image, component instance, or another visible layer.");
  }

  var bounds = getAbsoluteBounds(source);
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
    throw new Error("The current selection does not have a valid size.");
  }

  var requestedScale = clampNumber(scale, 1, 4);
  var safeScale = calculateSafeExportScale(bounds, requestedScale);

  var bytes = await source.exportAsync({
    format: "PNG",
    constraint: {
      type: "SCALE",
      value: safeScale
    }
  });

  cachedSource = {
    id: source.id,
    name: source.name,
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    scale: safeScale,
    requestedScale: requestedScale,
    autoScaled: safeScale < requestedScale,
    pixelWidth: Math.max(1, Math.round(bounds.width * safeScale)),
    pixelHeight: Math.max(1, Math.round(bounds.height * safeScale))
  };

  figma.ui.postMessage({
    type: "source-loaded",
    source: cachedSource,
    bytes: bytes
  });
}

async function createWarpNode(message) {
  if (!cachedSource) {
    throw new Error("Load a source frame or image first.");
  }

  var sourceNode = await getNodeById(cachedSource.id);
  var bounds = sourceNode ? getAbsoluteBounds(sourceNode) : cachedSource;
  var node = figma.createRectangle();
  figma.currentPage.appendChild(node);

  applyWarpImageToNode(node, message);
  placeNodeFromSource(node, bounds, message.topOffset || 0);
  writePreset(node, message, sourceNode || null);

  figma.currentPage.selection = [node];
  figma.viewport.scrollAndZoomIntoView([node]);
  figma.notify("Numeric warp result created.");
}

async function updateWarpNode(message) {
  if (!cachedSource) {
    throw new Error("Load the new source frame or image first.");
  }

  var target = cachedTargetId ? await getNodeById(cachedTargetId) : null;
  if (!target || !readPreset(target)) {
    target = findWarpTarget(figma.currentPage.selection);
  }
  if (!target || !readPreset(target)) {
    throw new Error("Select an existing warp result as the update target.");
  }

  var sourceNode = await getNodeById(cachedSource.id);
  var bounds = sourceNode ? getAbsoluteBounds(sourceNode) : cachedSource;

  applyWarpImageToNode(target, message);
  placeNodeFromSource(target, bounds, message.topOffset || 0);
  writePreset(target, message, sourceNode || null);

  figma.currentPage.selection = [target];
  figma.viewport.scrollAndZoomIntoView([target]);
  figma.notify("Warp result updated with the same numeric settings.");
}

function applyWarpImageToNode(node, message) {
  var bytes = toUint8Array(message.bytes);
  var image;
  try {
    image = figma.createImage(bytes);
  } catch (error) {
    var text = error && error.message ? error.message : String(error);
    if (/too large/i.test(text)) {
      throw new Error("The generated PNG is still too large for Figma. Try a smaller selection, or lower the source artwork size before warping.");
    }
    throw error;
  }
  var width = Math.max(0.01, Number(message.outputWidth) || 1);
  var height = Math.max(0.01, Number(message.outputHeight) || 1);

  if (typeof node.resizeWithoutConstraints === "function") {
    node.resizeWithoutConstraints(width, height);
  } else {
    node.resize(width, height);
  }

  node.fills = [{
    type: "IMAGE",
    imageHash: image.hash,
    scaleMode: "FILL"
  }];
  node.strokes = [];
  node.name = node.name && readPreset(node)
    ? node.name
    : ((cachedSource && cachedSource.name ? cachedSource.name : "Selection") + " - numeric warp");
}

function placeNodeFromSource(node, sourceBounds, topOffset) {
  if (!sourceBounds) {
    return;
  }
  node.x = sourceBounds.x;
  node.y = sourceBounds.y - topOffset;
}

function writePreset(node, message, sourceNode) {
  var params = normalizeParams(message.params || {});
  var preset = {
    version: 1,
    kind: "numeric-arch-warp",
    params: params,
    output: {
      width: Number(message.outputWidth) || 0,
      height: Number(message.outputHeight) || 0,
      topOffset: Number(message.topOffset) || 0,
      rasterWidth: Number(message.rasterWidth) || 0,
      rasterHeight: Number(message.rasterHeight) || 0,
      rasterScale: Number(message.rasterScale) || 1
    },
    source: {
      id: sourceNode ? sourceNode.id : cachedSource.id,
      name: sourceNode ? sourceNode.name : cachedSource.name,
      width: cachedSource.width,
      height: cachedSource.height,
      scale: cachedSource.scale,
      requestedScale: cachedSource.requestedScale,
      autoScaled: cachedSource.autoScaled
    },
    updatedAt: new Date().toISOString()
  };

  node.setPluginData(MARKER_KEY, "1");
  node.setPluginData(PRESET_KEY, JSON.stringify(preset));
  figma.clientStorage.setAsync(STORAGE_KEY, params);
  figma.ui.postMessage({
    type: "preset-saved",
    preset: preset,
    targetName: node.name
  });
}

function postSelectionSummary() {
  var selection = figma.currentPage.selection;
  var target = findWarpTarget(selection);
  var source = findWarpSource(selection, target);
  figma.ui.postMessage({
    type: "selection-summary",
    count: selection.length,
    hasTarget: Boolean(target),
    hasSource: Boolean(source),
    targetName: target ? target.name : "",
    sourceName: source ? source.name : ""
  });
}

function findWarpTarget(selection) {
  for (var i = 0; i < selection.length; i += 1) {
    if (readPreset(selection[i])) {
      return selection[i];
    }
  }
  return null;
}

function findWarpSource(selection, target) {
  for (var i = 0; i < selection.length; i += 1) {
    var node = selection[i];
    if (target && node.id === target.id) {
      continue;
    }
    if (!readPreset(node)) {
      return node;
    }
  }
  return null;
}

function readPreset(node) {
  if (!node || typeof node.getPluginData !== "function") {
    return null;
  }

  var raw = node.getPluginData(PRESET_KEY);
  if (!raw) {
    return null;
  }

  try {
    var preset = JSON.parse(raw);
    if (preset && preset.kind === "numeric-arch-warp") {
      return preset;
    }
  } catch (error) {
    return null;
  }
  return null;
}

function normalizeParams(params) {
  return {
    bendPercent: clampNumber(params.bendPercent, -90, 90),
    curvePower: clampNumber(params.curvePower, 0.5, 6),
    segments: Math.round(clampNumber(params.segments, 16, 1024))
  };
}

function calculateSafeExportScale(bounds, requestedScale) {
  var width = Math.max(1, Number(bounds.width) || 1);
  var height = Math.max(1, Number(bounds.height) || 1);
  var scale = requestedScale;
  scale = Math.min(scale, MAX_RASTER_EDGE / width, MAX_RASTER_EDGE / height);
  scale = Math.min(scale, Math.sqrt(MAX_RASTER_PIXELS / (width * height)));
  return clampNumber(scale, MIN_EXPORT_SCALE, requestedScale);
}

function getAbsoluteBounds(node) {
  if (node.absoluteBoundingBox) {
    return {
      x: node.absoluteBoundingBox.x,
      y: node.absoluteBoundingBox.y,
      width: node.absoluteBoundingBox.width,
      height: node.absoluteBoundingBox.height
    };
  }

  return {
    x: typeof node.x === "number" ? node.x : 0,
    y: typeof node.y === "number" ? node.y : 0,
    width: typeof node.width === "number" ? node.width : 1,
    height: typeof node.height === "number" ? node.height : 1
  };
}

async function getNodeById(id) {
  if (!id) {
    return null;
  }
  if (typeof figma.getNodeByIdAsync === "function") {
    return await figma.getNodeByIdAsync(id);
  }
  return figma.getNodeById(id);
}

function toUint8Array(bytes) {
  if (bytes instanceof Uint8Array) {
    return bytes;
  }
  if (bytes instanceof ArrayBuffer) {
    return new Uint8Array(bytes);
  }
  if (bytes && bytes.buffer instanceof ArrayBuffer) {
    return new Uint8Array(bytes.buffer);
  }
  if (Array.isArray(bytes)) {
    return new Uint8Array(bytes);
  }
  throw new Error("Could not read the generated image data.");
}

function clampNumber(value, min, max) {
  var number = Number(value);
  if (!Number.isFinite(number)) {
    return min;
  }
  return Math.min(max, Math.max(min, number));
}
