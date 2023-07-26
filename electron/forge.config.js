module.exports = {
  packagerConfig: {
    asar: false,
    icon: "assets/appIcon.icns",
    platform: "mas",
    osxSign: {
      platform: "mas",
      "gatekeeper-assess": false,
      entitlements: 'entitlements.mas.plist',
      "entitlements-inherit": "entitlements.mas.inherit.plist",
      "identity": 'Konstantin Dyachenko (F7AAPNP85N)',
      provisioningProfile: process.env.PP_PATH,
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
  plugins: []
};
