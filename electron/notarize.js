const { notarize } = require('electron-notarize');
const { signAsync } = require ('electron-osx-sign');

const appleIdPassword = `rfzy-cowy-owqm-zocn`;
const appPath = '/Users/menzorg/dev/packages/deepcase/electron/dist/mac/Deep.Case.app'
const appBundleId = 'deep.case.app';
const appleId = 'menzorg@gmail.com';

exports.default = async function packageTask () {
  console.log('notarizing');
  return await notarize({
    appBundleId,
    appPath,
    appleId,
    appleIdPassword,
  });
  console.log('done');
}