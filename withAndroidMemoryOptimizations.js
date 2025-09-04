const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Plugin do Expo para otimizações de memória no Android
 * Adiciona largeHeap e hardwareAccelerated que são preservados pelo Expo
 */
function withAndroidMemoryOptimizations(config) {
  return withAndroidManifest(config, async config => {
    let androidManifest = config.modResults;
    const application = androidManifest.manifest?.application?.[0];
    if (application) {
      application.$['android:largeHeap'] = 'true';

      application.$['android:hardwareAccelerated'] = 'true';

      if (!application.$['android:allowBackup']) {
        application.$['android:allowBackup'] = 'true';
      }

      console.log('✔ Android Memory Optimizations applied:');
      console.log('   - largeHeap: true');
      console.log('   - hardwareAccelerated: true');
    }

    return config;
  });
}

module.exports = withAndroidMemoryOptimizations;
