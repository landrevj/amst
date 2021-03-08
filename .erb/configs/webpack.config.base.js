/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import { dependencies as externals } from '../../src/package.json';

// /////////////// mikro-orm
// const optionalModules = new Set([
//   ...Object.keys(require('../../src/node_modules/knex/package.json').browser),
//   ...Object.keys(require('../../src/node_modules/@mikro-orm/core/package.json').peerDependencies),
//   ...Object.keys(require('../../src/node_modules/@mikro-orm/core/package.json').devDependencies || {})
// ]);
// /////////////// \mikro-orm

export default {
  externals: [...Object.keys(externals || {})],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },

  output: {
    path: path.join(__dirname, '../../src'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [path.join(__dirname, '../src'), 'node_modules'],
  },

  plugins: [

    // /////////////// mikro-orm
    // new webpack.EnvironmentPlugin({ WEBPACK: true }),
    // new webpack.IgnorePlugin({
    //   checkResource: resource => {
    //     const baseResource = resource.split('/', resource[0] === '@' ? 2 : 1).join('/');

    //     if (optionalModules.has(baseResource)) {
    //       try {
    //         require.resolve(resource);
    //         return false;
    //       } catch {
    //         return true;
    //       }
    //     }

    //     return false;
    //   },
    // }),
    // /////////////// \mikro-orm

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
  ],
};
