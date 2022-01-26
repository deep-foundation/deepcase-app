const fs = require('fs');
const shell = require('child_process').execSync;

const originalPath = 'node_modules/@deep-foundation';
const unpackagedPath = 'dist/linux-unpacked/resources/app/node_modules/@deep-foundation';

exports.default = async function(context) {
  try {
    if (fs.existsSync(unpackagedPath)) {
      fs.rmSync(`${unpackagedPath}/hasura`, { recursive: true });
      shell(`mkdir -p ${unpackagedPath}/hasura`);
      shell(`cp -r ${originalPath}/hasura* ${unpackagedPath}/hasura`);

      fs.rmSync(`${unpackagedPath}/deeplinks`, { recursive: true });
      shell(`mkdir -p ${unpackagedPath}/deeplinks`);
      shell(`cp -r ${originalPath}/deeplinks/* ${unpackagedPath}/deeplinks`);
    }
  } catch(err) {
    console.error(err);
  }
}