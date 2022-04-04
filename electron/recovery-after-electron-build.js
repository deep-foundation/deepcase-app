const fs = require('fs');
const shell = require('child_process').execSync;

const originalPath = 'node_modules/@deep-foundation';
const unpackagedPathLinux = 'dist/linux-unpacked/resources/app/node_modules/@deep-foundation';
const unpackagedPathWindows = 'dist\\win-unpacked\\resources\\app\\node_modules\\@deep-foundation';
const tsPath = 'node_modules/typescript';
const macAppPath = 'dist/mac/Deep.Case.app/Contents/Resources/app';

exports.default = async function(context) {
  try {
    if (fs.existsSync(macAppPath)) {
      //electron-builder force removes .d.ts files. It brokes ts-node/register(config) for migrations
      console.log('recovering');
      fs.rmSync(`${macAppPath}/${tsPath}`, { recursive: true });
      shell(`cp -r ${tsPath} ${macAppPath}/${tsPath}`);
    }
    if (fs.existsSync(unpackagedPathLinux)) {
      console.log('recovering');
      fs.rmSync(`${unpackagedPathLinux}/hasura`, { recursive: true });
      shell(`mkdir ${unpackagedPathLinux}/hasura`);
      shell(`cp -r ${originalPath}/hasura/ ${unpackagedPathLinux}`);
      fs.rmSync(`${unpackagedPathLinux}/hasura/node_modules`, { recursive: true });

      fs.rmSync(`${unpackagedPathLinux}/deeplinks`, { recursive: true });
      shell(`mkdir ${unpackagedPathLinux}/deeplinks`);
      shell(`cp -r ${originalPath}/deeplinks/ ${unpackagedPathLinux}`);
      fs.rmSync(`${unpackagedPathLinux}/deeplinks/node_modules`, { recursive: true });
    }
    if (fs.existsSync(unpackagedPathWindows)) {
      console.log('recovering');
      fs.rmSync(`${unpackagedPathWindows}\\hasura`, { recursive: true });
      shell(`mkdir ${unpackagedPathWindows}\\hasura`);
      shell(`cp -r ${originalPath}\\hasura\\ ${unpackagedPathWindows}`);
      fs.rmSync(`${unpackagedPathWindows}\\hasura\\node_modules`, { recursive: true });

      fs.rmSync(`${unpackagedPathWindows}\\deeplinks`, { recursive: true });
      shell(`mkdir ${unpackagedPathWindows}\\deeplinks`);
      shell(`cp -r ${originalPath}\\deeplinks\\ ${unpackagedPathWindows}`);
      fs.rmSync(`${unpackagedPathWindows}\\deeplinks\\node_modules`, { recursive: true });
    }
  } catch(err) {
    console.error(err);
  }
}