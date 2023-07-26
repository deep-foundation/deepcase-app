module.exports = {
  packagerConfig: {
    asar: false,
    icon: "assets/appIcon.icns",
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO'
      }
    }
  ],
  plugins: []
};
