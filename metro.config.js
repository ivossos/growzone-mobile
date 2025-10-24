const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const createConfig = () => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/react-native"),
    // Optimize for Android memory usage
    minifierConfig: {
      mangle: {
        keep_fnames: true,
      },
      output: {
        ascii_only: true,
        quote_keys: true,
        wrap_iife: true,
      },
      sourceMap: {
        includeSources: false,
      },
      toplevel: false,
      compress: {
        reduce_funcs: false,
      },
    },
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
    // Mock react-native-vision-camera for Web platform
    resolveRequest: (context, moduleName, platform) => {
      if (platform === 'web' && moduleName === 'react-native-vision-camera') {
        return {
          filePath: __dirname + '/src/__mocks__/react-native-vision-camera.js',
          type: 'sourceFile',
        };
      }
      // Default resolution
      return context.resolveRequest(context, moduleName, platform);
    },
  };
  
  // Android-specific optimizations
  if (process.env.PLATFORM === 'android') {
    config.serializer = {
      ...config.serializer,
      getModulesRunBeforeMainModule: () => [
        require.resolve('react-native/Libraries/Core/InitializeCore'),
      ],
    };
  }
  
  return config;
};

const config = createConfig();
module.exports = withNativeWind(config, { input: "./src/styles/global.css" });
