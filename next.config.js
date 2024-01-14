import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import nextEnv from 'next-env';
import dotenvLoad from 'dotenv-load';

dotenvLoad();
 
const withNextEnv = nextEnv();

// const NEXT_PUBLIC_DEEPLINKS_URL = process.env.NEXT_PUBLIC_DEEPLINKS_URL || 'http://localhost:3006';
const DOCKER = !!+process.env.DOCKER;
const DEEPLINKS_URL = DOCKER ? 'http://host.docker.internal:3006' : 'http://localhost:3006';

export default withNextEnv({
  distDir: 'app',
  webpack5: true,
  future: { webpack5: true },
  strictMode: false,
  async headers() {
      return [
          {
              source: "/api/:path*",
              headers: [
                  { key: "Access-Control-Allow-Origin", value: "*" },
              ]
          }
      ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:gql*',
        destination: `${DEEPLINKS_URL}/:gql*`
        // destination: `${NEXT_PUBLIC_DEEPLINKS_URL}/:gql*`
      },
      {
        source: '/api/:file*',
        destination: `${DEEPLINKS_URL}/:file*`
        // destination: `${NEXT_PUBLIC_DEEPLINKS_URL}/:file*`
      },
    ]
  },
  webpack: (config) => {
    // Exclude .tsx and .ts files
    const excludePattern = /\.tsx?$/;
    config.module.rules.push({
      test: excludePattern,
      use: [],
    });
    config.resolve.extensions = config.resolve.extensions.filter(item => !excludePattern.test(item));

    config.module.rules.push({
      test: /\.cozo$/,
      use: 'raw-loader',
    });

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
