// Metro charge ce fichier en CommonJS : il doit rester en .js (en .ts, TypeScript
// signalait "Cannot find name 'module'").
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Les fichiers .svg sont importés comme composants React (react-native-svg-transformer)
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

module.exports = config;
