/**
 * Webpack config for production electron main process
 */

import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../scripts/CheckNodeEnv';
import DeleteSourceMaps from '../scripts/DeleteSourceMaps';

CheckNodeEnv('production');
DeleteSourceMaps();

const devtoolsConfig = process.env.DEBUG_PROD === 'true' ? {
  devtool: 'source-map'
} : {};

export default merge(baseConfig, {
  ...devtoolsConfig,

  mode: 'production',

  target: 'electron-main',

  entry: './src/main.dev.ts',

  output: {
    path: path.join(__dirname, '../../'),
    filename: './src/main.prod.js',
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,

        // /////////////// mikro-orm
        // terserOptions: {
          // We want to minify the bundle, but don't want Terser to change the names of our entity
          // classes. This can be controlled in a more granular way if needed, (see
          // https://terser.org/docs/api-reference.html#mangle-options) but the safest default
          // config is that we simply disable mangling altogether but allow minification to proceed.
          // mangle: false,
          // Similarly, Terser's compression may at its own discretion change function and class names.
          // While it only rarely does so, it's safest to also disable changing their names here.
          // This can be controlled in a more granular way if needed (see
          // https://terser.org/docs/api-reference.html#compress-options).
          // compress: {
            // keep_classnames: true,
            // keep_fnames: true,
          // },
        // },
        // /////////////// \mikro-orm
      }),
    ]
  },

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: false,
      START_MINIMIZED: false,
    }),
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
});
