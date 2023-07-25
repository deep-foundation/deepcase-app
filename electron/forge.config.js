module.exports = {
  packagerConfig: {
    asar: false,
    osxSign: {
      provisioningProfile: 'developer-id-deepapp.provisionprofile',
      platform: 'mas',
      type: 'development',
      entitlements: 'entitlements.mas.plist',
      hardenedRuntime: true
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
  plugins: [],
};
