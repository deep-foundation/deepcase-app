const { notarize } = require('electron-notarize');
const { signAsync } = require ('electron-osx-sign');

const appPath = '/Users/menzorg/dev/packages/deepcase/electron/dist/mac/Deep.Case.app'
const appBundleId = 'deep.case.app';
const appleId = 'menzorg@gmail.com';

exports.default = async function packageTask (context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }
  const appName = context.packager.appInfo.productFilename;
  console.log('notarizing');
  return await notarize({
    appBundleId,
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
  });
  console.log('done');
}