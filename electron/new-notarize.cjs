const { notarize } = require('electron-notarize');
const fs = require('fs');

console.log(fs.existsSync('./out'));
console.log(fs.existsSync('./out/Deep.Case-darwin-x64'));
console.log(fs.existsSync('./out/Deep.Case-darwin-x64/Deep.Case.app'));

const appBundleId = 'deep.app';

console.log({
  appBundleId,
  appPath: `./out/Deep.Case-darwin-x64/Deep.Case.app`,
  appleId: process.env.APPLEID,
  appleIdPassword: process.env.APPLEIDPASS,
});
const notarizeFunc = async () => {
  console.log('notarize started');
  const result = await notarize({
    appBundleId,
    appPath: `Deep.Case.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
  });
  console.log(result);
  console.log('notarize complete');
}

notarizeFunc();