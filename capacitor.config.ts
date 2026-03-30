import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'kahoot',
  webDir: 'www',
  plugins: {
    SocialLogin: {
      providers: {
        google : true,
        facebook : false,
        apple : false,
        twitter : false
      },
      loglevel:1
    }
  }
};

export default config;
