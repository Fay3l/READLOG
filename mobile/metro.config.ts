const { getDefaultConfig } = require("expo/metro-config");
const { createRequire } = require("node:module");
const requireResolve = createRequire(__filename);

declare const __dirname: string;
declare const __filename: string;

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: requireResolve.resolve("react-native-svg-transformer/expo")
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext: string) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"]
  };

  return config;
})();