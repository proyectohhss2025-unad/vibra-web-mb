/**
 * Expo Config Plugin: withFirebaseManifestFix
 *
 * Resuelve conflictos de manifest merger entre expo-notifications
 * y @react-native-firebase/messaging.
 *
 * Agrega tools:replace a los meta-data conflictivos para que
 * los valores del app (expo-notifications) sobreescriban a los
 * del library (@react-native-firebase/messaging).
 */
const { withAndroidManifest } = require('expo/config-plugins');

function withFirebaseManifestFix(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;

    // Asegurar namespace tools en el <manifest>
    if (!manifest['manifest'].$['xmlns:tools']) {
      manifest['manifest'].$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // Buscar los meta-data en <application>
    const application = manifest['manifest']['application']?.[0];
    if (!application) return config;

    const metaData = application['meta-data'] || [];

    for (const item of metaData) {
      const name = item.$['android:name'];

      if (name === 'com.google.firebase.messaging.default_notification_channel_id') {
        item.$['tools:replace'] = 'android:value';
      }

      if (name === 'com.google.firebase.messaging.default_notification_color') {
        item.$['tools:replace'] = 'android:resource';
      }
    }

    return config;
  });
}

module.exports = withFirebaseManifestFix;
