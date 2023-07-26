const { notarize } = require('electron-notarize');

const appBundleId = 'deep.app';

console.log({
  appBundleId,
  appPath: `Deep.Case.app`,
  appleId: process.env.APPLEID,
  appleIdPassword: process.env.APPLEIDPASS,
});
notarize({
  appBundleId,
  appPath: `Deep.Case.app`,
  appleId: process.env.APPLEID,
  appleIdPassword: process.env.APPLEIDPASS,
});
