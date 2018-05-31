module.exports = {
  "presets": [
    ["@babel/env", { modules: 'commonjs' }],
    ["@babel/preset-stage-1", { "loose": true, "decoratorsLegacy": true }],
    "@babel/preset-react",
    "@babel/flow"
  ],
  "plugins": [
    "@babel/plugin-transform-object-assign",
    ["@babel/transform-runtime", { "polyfill": false, "useBuiltIns": true }],
  ],
  "ignore": [
    "node_modules"
  ]
};