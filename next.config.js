import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import nextEnv from 'next-env';
import dotenvLoad from 'dotenv-load';

dotenvLoad();
 
const withNextEnv = nextEnv();

export default withNextEnv({
  distDir: 'app',
  webpack5: true,
  future: { webpack5: true },
  strictMode: false,
  webpack: (config) => {
    config.resolve.fallback = {
      "buffer": require.resolve('buffer/'),
      "os": false,
      "fs": false,
      "tls": false,
      "net": false,
      "path": false,
      "zlib": false,
      "http": false,
      "https": false,
      "stream": false,
      "crypto": false,
    };

    return config;
  },
});
