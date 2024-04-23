const webpack = require("webpack");
const bb = require('browser-builtins');
const nextEnv = require('next-env');
const dotenvLoad = require('dotenv-load');
const { i18n } = require('./next-i18next.config');

dotenvLoad();

const withNextEnv = nextEnv();

// const NEXT_PUBLIC_DEEPLINKS_URL = process.env.NEXT_PUBLIC_DEEPLINKS_URL || 'http://localhost:3006';
const DOCKER = !!+process.env.DOCKER;
const DEEPLINKS_URL = DOCKER ? 'http://host.docker.internal:3006' : 'http://localhost:3006';

 /** @type {import('next').NextConfig}*/
const config = {
  ...(process.env.GITHUB_REPOSITORY ? {
    basePath: `/${process.env.GITHUB_REPOSITORY.split('/')[1]}`,
  } : {}),
  distDir: 'app',
  strictMode: false,

  allowImportingTsExtensions: true,
  webpack5: true,
  future: { webpack5: true },
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
  webpack: (config, { isServer }) => {
    // Exclude .tsx and .ts files
    const excludePattern = /\.(ts|tsx)?$/;
    config.module.rules.push({
      test: excludePattern,
      exclude: /node_modules/,
      use: [],
    });
    config.resolve.extensions = config.resolve.extensions.filter(item => !excludePattern.test(item));

    console.log(config.resolve.extensions);
    console.log(config.output.publicPath);

    config.module.rules.push({
      test: /\.cozo$/,
      use: 'raw-loader',
    });
    // config.resolve.alias = {
    //   ...(config.resolve.alias || {}),
    //   "node:buffer": require.resolve('buffer/'),
    // };
    // if (!isServer) {
      config.resolve.fallback = {
        // "buffer": require.resolve('buffer/'),
        "child_process": false,
        "dgram": false,
        "net": false,
        "dns": false,
        "module": false,
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
    // }
    // config.resolve.fallback = {
    //   "buffer": require.resolve('buffer/'),
    //   "fs": require.resolve("browserify-fs"), 
    //   "util": require.resolve("util"), 
    //   "http": require.resolve("stream-http"),
    //   "https": require.resolve("https-browserify"),
    //   "tls": require.resolve("tls-browserify"),
    //   "net": require.resolve("net-browserify"),
    //   "crypto": require.resolve("crypto-browserify"), 
    //   "path": require.resolve("path-browserify"),
    //   "os": require.resolve("os-browserify"), 
    //   "stream": require.resolve("stream-browserify"),
    //   "zlib": require.resolve("browserify-zlib")
    // };

    // console.log(config.plugins);

    config.plugins.push(
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
      new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
        const mod = resource.request.replace(/^node:/, "");
        switch (mod) {
          case "buffer":
            resource.request = "buffer";
            break;
          case "stream":
            resource.request = "readable-stream";
            break;
          default:
            if (bb[mod]) resource.request = bb[mod];
            else throw new Error(`Not found ${mod}`);
        }
      }),
      // new WorkerUrlPlugin(),
    );

    return config;
  },
  ...(+(process?.env?.NEXT_PUBLIC_I18N_DISABLE || 0) ? {} : { i18n }),
};

module.exports = withNextEnv(config);
