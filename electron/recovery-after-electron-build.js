const fs = require('fs');
const shell = require('child_process').execSync;

const originalPath = 'node_modules/@deep-foundation';
const unpackagedPathLinux = 'dist/linux-unpacked/resources/app/node_modules/@deep-foundation';
const unpackagedPathWindows = 'dist\\win-unpacked\\resources\\app\\node_modules\\@deep-foundation';

exports.default = async function(context) {
  try {
    if (fs.existsSync(unpackagedPathLinux)) {
      console.log('recovering');
      fs.rmSync(`${unpackagedPathLinux}/hasura`, { recursive: true });
      shell(`mkdir ${unpackagedPathLinux}/hasura`);
      shell(`cp -r ${originalPath}/hasura/ ${unpackagedPathLinux}`);

      fs.rmSync(`${unpackagedPathLinux}/deeplinks`, { recursive: true });
      shell(`mkdir ${unpackagedPathLinux}/deeplinks`);
      shell(`cp -r ${originalPath}/deeplinks/ ${unpackagedPathLinux}`);
    }
    if (fs.existsSync(unpackagedPathWindows)) {
      console.log('recovering');
      fs.rmSync(`${unpackagedPathWindows}\\hasura`, { recursive: true });
      shell(`mkdir ${unpackagedPathWindows}\\hasura`);
      shell(`cp -r ${originalPath}\\hasura\\ ${unpackagedPathWindows}`);

      fs.rmSync(`${unpackagedPathWindows}\\deeplinks`, { recursive: true });
      shell(`mkdir ${unpackagedPathWindows}\\deeplinks`);
      shell(`cp -r ${originalPath}\\deeplinks\\ ${unpackagedPathWindows}`);
    }
  } catch(err) {
    console.error(err);
  }
}