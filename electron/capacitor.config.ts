import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'deep.case.app',
  appName: 'Deep.Case',
  webDir: 'app',
  bundledWebRuntime: false,
  server: {
    url: "http://localhost:3008",
    cleartext: true,
  },
};

export default config;
