const { signAsync } = require('@electron/osx-sign')
signAsync({
  app: 'Deep.Case.app',
  provisioningProfile: `${process.env.RUNNER_TEMP}/developer-id-deepapp.provisionprofile`,
  entitlements: 'entitlements.mas.plist',
  hardenedRuntime: true
})
  .then(function () {
    console.log('sign complete');
  })
  .catch(function (err) {
    console.log('sign error', err);
  })
