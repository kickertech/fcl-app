module.exports = {
  presets: [
    ['@vue/cli-plugin-babel/preset',
      {
        ignoreBrowserslistConfig: true,
        targets: {
          node: "current"
        }
      }
    ]
  ]
}
