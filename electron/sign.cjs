const { signAsync } = require('@electron/osx-sign')
signAsync({
  app: 'out/Deep.Case-darwin-x64/Deep.Case.app',
  provisioningProfile: process.env.PP_PATH,
  entitlements: 'entitlements.mas.plist',
  optionsForFile: (filePath) => {
    return {
      entitlements: 'entitlements.mas.inherit.plist',
    }
  },
  hardenedRuntime: true
})
  .then(function () {
    console.log('sign complete');
  })
  .catch(function (err) {
    console.log('sign error', err);
  })
