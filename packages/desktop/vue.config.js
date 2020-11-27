module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      preload: "src/preload.js",
      builderOptions: {
        appId: "com.fcl.desktop",
        productName: "fcl",
        files: ["**/*", "dist/**/*"],
        icon: "./src/assets/icons/icon.png",
        mac: {
          artifactName: "fcl-desktop.${ext}",
        },
        win: {
          artifactName: "fcl-desktop.${ext}",
        },
        linux: {
          category: "Utility",
          executableName: "fcl-desktop",
          artifactName: "fcl-desktop.${ext}",
        },
        extraFiles: [],
      },
    },
  },
};
