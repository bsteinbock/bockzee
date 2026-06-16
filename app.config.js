const productionAppId = 'com.billsteinbock.bockzee';
const developmentAppId = 'com.billsteinbock.bockzee.dev';
const projectId = '9a858fcb-43c2-4233-8ab5-904c3ff02d72';

function getAppVariant() {
  if (process.env.APP_VARIANT) {
    return process.env.APP_VARIANT;
  }

  if ((process.env.EAS_BUILD_PROFILE || '').startsWith('development')) {
    return 'development';
  }

  return 'production';
}

module.exports = () => {
  const variant = getAppVariant();
  const isDevelopment = variant === 'development';
  const appId = isDevelopment ? developmentAppId : productionAppId;

  return {
    expo: {
      name: isDevelopment ? 'Bockzee (dev)' : 'Bockzee',
      slug: 'bockzee',
      scheme: appId,
      version: '1.0.0',
      runtimeVersion: {
        policy: 'appVersion',
      },
      orientation: 'portrait',
      icon: './assets/icon.png',
      userInterfaceStyle: 'automatic',
      updates: {
        url: `https://u.expo.dev/${projectId}`,
        enabled: true,
        checkAutomatically: 'ON_LOAD',
        fallbackToCacheTimeout: 3000,
      },
      ios: {
        supportsTablet: true,
        bundleIdentifier: appId,
        infoPlist: {
          ITSAppUsesNonExemptEncryption: false,
        },
      },
      android: {
        package: appId,
        adaptiveIcon: {
          backgroundColor: '#E6F4FE',
          foregroundImage: './assets/android-icon-foreground.png',
          backgroundImage: './assets/android-icon-background.png',
          monochromeImage: './assets/android-icon-monochrome.png',
        },
      },
      web: {
        favicon: './assets/favicon.png',
      },
      plugins: ['expo-router', 'react-native-legal'],
      experiments: {
        typedRoutes: true,
        reactCompiler: true,
      },
      extra: {
        router: {},
        appVariant: variant,
        eas: {
          projectId,
        },
      },
      owner: 'bsteinbk',
    },
  };
};
