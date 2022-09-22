/* eslint-disable import/no-commonjs */
/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();
  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: true,
          inlineRequires: true,
        },
        fencedCode: require.resolve('./tranformers/fencedCodeTransformer.js'),
      }),
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      assetPlugins: ['react-native-svg-asset-plugin'],
      svgAssetPlugin: {
        pngCacheDir: '.png-cache',
        scales: [1],
        output: {
          compressionLevel: 6,
        },
      },
    },
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg', 'cjs'],
      extraNodeModules: {
        stream: require.resolve('readable-stream'),
      },
    },
    maxWorkers: 2,
  };
})();
