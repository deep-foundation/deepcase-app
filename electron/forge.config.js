module.exports = {
  packagerConfig: {
    asar: false,
    icon: "assets/appIcon.icns",
    osxSign: {
      "entitlements": "entitlements.plist",
      "entitlements-inherit": "entitlements.mas.inherit.plist",
      "identity": 'Konstantin Dyachenko (F7AAPNP85N)',
      provisioningProfile: `${process.env.RUNNER_TEMP}/developer-id-deepapp.provisionprofile`,
      hardenedRuntime: true
    },
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
      }
    }
  ],
  plugins: []
};
