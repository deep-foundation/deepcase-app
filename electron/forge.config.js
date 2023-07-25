module.exports = {
  packagerConfig: {
    asar: false,
    icon: "assets/appIcon.icns",
    osxSign: {
      provisioningProfile: `${process.env.RUNNER_TEMP}/developer-id-deepapp.provisionprofile`,
      entitlements: 'entitlements.mas.plist',
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
