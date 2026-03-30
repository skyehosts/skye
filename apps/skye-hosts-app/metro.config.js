// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath =
  require.resolve("react-native-svg-transformer/expo");

// Remove svg from assetExts and add to sourceExts so the transformer handles them
// Exclude test/spec files from the bundle — they live inside app/ but are not routes
config.resolver.blockList = /.*\.(spec|test)\.(ts|tsx|js|jsx)$/;

config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg",
);
config.resolver.sourceExts.push("svg");

module.exports = config;
