const fs = require('fs');
const shell = require('child_process').execSync;

const delimetr = process.platform === 'win32' ? '\\' : '/';
const deepPath = `node_modules${delimetr}@deep-foundation`;
const tsPath = `node_modules${delimetr}typescript`;
const typesPath = `node_modules${delimetr}@types`;
const linuxAppPath = 'dist/linux-unpacked/resources/app';
const windowsAppPath = 'dist\\win-unpacked\\resources\\app';
const macAppPath = 'dist/mac/Deep.Case.app/Contents/Resources/app';

exports.default = async function(context) {
  try {
    if (fs.existsSync(macAppPath)) {
      //electron-builder force removes .d.ts files. It brokes ts-node/register(config) for migrations
      console.log('recovering');
      fs.rmSync(`${macAppPath}/node_modules`, { recursive: true });
      shell(`cp -r node_modules ${macAppPath}/node_modules`);
    }
    if (fs.existsSync(linuxAppPath)) {
      fs.rmSync(`${linuxAppPath}/node_modules`, { recursive: true });
      shell(`cp -r node_modules ${linuxAppPath}/node_modules`);
    }
    if (fs.existsSync(windowsAppPath)) {
      console.log('recovering');
      fs.rmSync(`${windowsAppPath}\\node_modules`, { recursive: true });
      shell(`cp -r node_modules ${windowsAppPath}\\node_modules`);
    }
  } catch(err) {
    console.error(err);
  }
}