module.exports = {
  packagerConfig: {
    asar: false,
    icon: "assets/appIcon.icns",
    osxNotarize:{
      tool: 'notarytool',
      appleId: process.env.APPLEID,
      appleIdPassword: process.env.APPLEIDPASS,
      teamId: 'F7AAPNP85N'
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO'
        additionalDMGOptions:{
          "code-sign": {
            "signing-identity": 'Konstantin Dyachenko (F7AAPNP85N)'
          }
        }
      }
    }
  ],
  plugins: []
};
