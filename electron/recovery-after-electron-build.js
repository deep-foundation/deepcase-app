const fs = require('fs');
const shell = require('child_process').execSync;

const delimetr = process.platform === 'win32' ? '\\' : '/';
const deepPath = `node_modules${delimetr}@deep-foundation`;
const tsPath = `node_modules${delimetr}typescript`;
const linuxAppPath = 'dist/linux-unpacked/resources/app';
const windowsAppPath = 'dist\\win-unpacked\\resources\\app';
const macAppPath = 'dist/mac/Deep.Case.app/Contents/Resources/app';

exports.default = async function(context) {
  try {
    if (fs.existsSync(macAppPath)) {
      //electron-builder force removes .d.ts files. It brokes ts-node/register(config) for migrations
      console.log('recovering');
      fs.rmSync(`${macAppPath}/${tsPath}`, { recursive: true });
      shell(`cp -r ${tsPath} ${macAppPath}/${tsPath}`);
    }
    if (fs.existsSync(linuxAppPath)) {
      console.log('recovering');
      fs.rmSync(`${linuxAppPath}/${deepPath}/hasura`, { recursive: true });
      shell(`mkdir ${linuxAppPath}/${deepPath}/hasura`);
      shell(`cp -r ${deepPath}/hasura ${linuxAppPath}/${deepPath}/hasura`);
      if (fs.existsSync(`${linuxAppPath}/${deepPath}/hasura/node_modules`)) fs.rmSync(`${linuxAppPath}/${deepPath}/hasura/node_modules`, { recursive: true });

      fs.rmSync(`${linuxAppPath}/${deepPath}/deeplinks`, { recursive: true });
      shell(`mkdir ${linuxAppPath}/${deepPath}/deeplinks`);
      shell(`cp -r ${deepPath}/deeplinks ${linuxAppPath}/${deepPath}/deeplinks`);
      if (fs.existsSync(`${linuxAppPath}/${deepPath}/deeplinks/node_modules`)) fs.rmSync(`${linuxAppPath}/${deepPath}/deeplinks/node_modules`, { recursive: true });

      fs.rmSync(`${linuxAppPath}/${tsPath}`, { recursive: true });
      shell(`cp -r ${tsPath} ${linuxAppPath}/${tsPath}`);
    }
    if (fs.existsSync(windowsAppPath)) {
      console.log('recovering');
      fs.rmSync(`${windowsAppPath}\\${deepPath}\\hasura`, { recursive: true });
      shell(`mkdir ${windowsAppPath}\\${deepPath}\\hasura`);
      shell(`cp -r ${deepPath}\\hasura ${windowsAppPath}\\${deepPath}`);
      if (fs.existsSync(`${linuxAppPath}}\\${deepPath}}\\hasura}\\node_modules`)) fs.rmSync(`${windowsAppPath}\\${deepPath}\\hasura\\node_modules`, { recursive: true });

      fs.rmSync(`${windowsAppPath}\\${deepPath}\\deeplinks`, { recursive: true });
      shell(`mkdir ${windowsAppPath}\\${deepPath}\\deeplinks`);
      shell(`cp -r ${deepPath}\\deeplinks ${windowsAppPath}\\${deepPath}`);
      if (fs.existsSync(`${linuxAppPath}}\\${deepPath}}\\deeplinks}\\node_modules`)) fs.rmSync(`${windowsAppPath}\\${deepPath}\\deeplinks\\node_modules`, { recursive: true });

      fs.rmSync(`${windowsAppPath}/${tsPath}`, { recursive: true });
      shell(`cp -r ${tsPath} ${windowsAppPath}/${tsPath}`);
    }
  } catch(err) {
    console.error(err);
  }
}