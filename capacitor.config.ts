import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soullink.app',
  appName: 'SoulLink',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#0A0A14',
  },
  ios: {
    backgroundColor: '#0A0A14',
    contentInset: 'always',
    scrollEnabled: false,
  },
  server: {
    // For dev: uncomment and set to your local IP to test on a device
    // url: 'http://192.168.1.100:5177',
    // cleartext: true,
  },
};

export default config;
