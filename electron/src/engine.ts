import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';
import * as internalIp from 'internal-ip';
import axios from 'axios';
import Debug from 'debug';
// @ts-ignore
import fixPath from 'fix-path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { remote } from 'electron'

function isElectron() {
  // @ts-ignore
  if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process?.type === 'renderer') {
      return true;
  }
  if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process?.versions?.electron) {
      return true;
  }
  if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator?.userAgent.indexOf('Electron') >= 0) {
      return true;
  }
  return false;
}

const appPath = process.cwd();
const filePath = path.normalize(`${appPath}/package.json`);
const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));


const debug = Debug('deeplinks:engine');
const log = debug.extend('log');
const error = debug.extend('error');
// Force enable this file errors output
const namespaces = Debug.disable();
const platform = process?.platform;
Debug.enable(`${namespaces ? `${namespaces},` : ``}${error.namespace}`);

const execP = promisify(exec);
const DOCKER = process.env.DOCKER || '0';
const DEEPLINKS_PUBLIC_URL = process.env.DEEPLINKS_PUBLIC_URL || 'http://localhost:3006';
const NEXT_PUBLIC_DEEPLINKS_SERVER = process.env.NEXT_PUBLIC_DEEPLINKS_SERVER || 'http://localhost:3007';
export interface ICallOptions {
  operation: 'run' | 'sleep' | 'reset';
  envs: { [key: string]: string; };
}

interface ICheckDeeplinksStatusReturn {
  result?: 1 | 0 | undefined;
  error?: any;
}
interface IExecEngineReturn {
  result?: {
    stdout: string;
    stderr: string;
  };
  error?: any;
}

interface IGenerateEngineStrOptions {
  operation: string;
  isDeeplinksDocker: 0 | 1 | undefined;
  isDeepcaseDocker: 0 | 1 | undefined;
  envs: any;
}
interface IGenerateEnvsOptions {
  isDeeplinksDocker: 0 | 1 | undefined;
  envs: any;
}

const _hasura = path.normalize(`${process.cwd()}/node_modules/@deep-foundation/hasura`); // даже если мы не в дипкейсе, то это скрипт из диплинкса, который зависит от хасуры, а значит в модулях есть хасура.
const _deeplinks = path.normalize( packageJson.name === '@deep-foundation/deeplinks' ? process.cwd() : `${process.cwd()}/node_modules/@deep-foundation/deeplinks`); // если в package.json название пакета не диплинксовое - то мы не там, а значит идём в модули

const handleEnvWindows = (k, envs) => ` set ${k}=${envs[k]}&&`;
const handleEnvUnix = (k, envs) => ` export ${k}=${envs[k]} &&`;
const handleEnv = platform === "win32" ? handleEnvWindows : handleEnvUnix;

const _generateEnvs = ({ envs, isDeeplinksDocker }: IGenerateEnvsOptions): string => {
  let envsStr = '';
  const isGitpod = !!process.env['GITPOD_GIT_USER_EMAIL'] && !!process.env['GITPOD_TASKS'];
  const hasuraPort = 8080;
  const deeplinksPort = 3006;
  const deepcasePort = 3007;

  envs['DEEPLINKS_PORT'] = envs['DEEPLINKS_PORT'] ? envs['DEEPLINKS_PORT'] : deeplinksPort;
  envs['DEEPCASE_PORT'] = envs['DEEPCASE_PORT'] ? envs['DEEPCASE_PORT'] : deepcasePort;
  envs['DEEPLINKS_PUBLIC_URL'] = envs['DEEPLINKS_PUBLIC_URL'] ? envs['DEEPLINKS_PUBLIC_URL'] : DEEPLINKS_PUBLIC_URL;
  envs['DEEPLINKS_HASURA_STORAGE_URL'] = envs['DEEPLINKS_HASURA_STORAGE_URL'] ? envs['DEEPLINKS_HASURA_STORAGE_URL'] : 'http://localhost:8000';
  envs['RESTORE_VOLUME_FROM_SNAPSHOT'] = envs['RESTORE_VOLUME_FROM_SNAPSHOT'] ? envs['RESTORE_VOLUME_FROM_SNAPSHOT'] : '1';
  envs['npm_config_yes'] = envs['npm_config_yes'] ? envs['npm_config_yes'] : 'true';
  envs['JWT_SECRET'] = envs['JWT_SECRET'] ? envs['JWT_SECRET'] : `${platform !== "win32" ? "'" : ''}{"type":"HS256","key":"3EK6FD+o0+c7tzBNVfjpMkNDi2yARAAKzQlk8O2IKoxQu4nF7EdAh8s3TwpHwrdWT6R"}${platform !== "win32" ? "'" : ''}`;
  envs['HASURA_GRAPHQL_DATABASE_URL'] = envs['HASURA_GRAPHQL_DATABASE_URL'] ? envs['HASURA_GRAPHQL_DATABASE_URL'] : 'postgres://postgres:postgrespassword@postgres:5432/postgres';
  envs['HASURA_GRAPHQL_ENABLE_CONSOLE'] = envs['HASURA_GRAPHQL_ENABLE_CONSOLE'] ? envs['HASURA_GRAPHQL_ENABLE_CONSOLE'] : 'true';
  envs['HASURA_GRAPHQL_DEV_MODE'] = envs['HASURA_GRAPHQL_DEV_MODE'] ? envs['HASURA_GRAPHQL_DEV_MODE'] : 'true';
  envs['HASURA_GRAPHQL_LOG_LEVEL'] = envs['HASURA_GRAPHQL_LOG_LEVEL'] ? envs['HASURA_GRAPHQL_LOG_LEVEL'] : 'debug';
  envs['HASURA_GRAPHQL_ENABLED_LOG_TYPES'] = envs['HASURA_GRAPHQL_ENABLED_LOG_TYPES'] ? envs['HASURA_GRAPHQL_ENABLED_LOG_TYPES'] : 'startup,http-log,webhook-log,websocket-log,query-log';
  envs['HASURA_GRAPHQL_ADMIN_SECRET'] = envs['HASURA_GRAPHQL_ADMIN_SECRET'] ? envs['HASURA_GRAPHQL_ADMIN_SECRET'] : 'myadminsecretkey';
  envs['HASURA_GRAPHQL_ENABLE_REMOTE_SCHEMA_PERMISSIONS'] = envs['HASURA_GRAPHQL_ENABLE_REMOTE_SCHEMA_PERMISSIONS'] ? envs['HASURA_GRAPHQL_ENABLE_REMOTE_SCHEMA_PERMISSIONS'] : 'true';
  envs['HASURA_GRAPHQL_UNAUTHORIZED_ROLE'] = envs['HASURA_GRAPHQL_UNAUTHORIZED_ROLE'] ? envs['HASURA_GRAPHQL_UNAUTHORIZED_ROLE'] : 'undefined';
  envs['POSTGRES_USER'] = envs['POSTGRES_USER'] ? envs['POSTGRES_USER'] : 'postgres';
  envs['POSTGRES_PASSWORD'] = envs['POSTGRES_PASSWORD'] ? envs['POSTGRES_PASSWORD'] : 'postgrespassword';
  envs['PGGSSENCMODE'] = envs['PGGSSENCMODE'] ? envs['PGGSSENCMODE'] : 'disable';
  envs['PGSSLMODE'] = envs['PGSSLMODE'] ? envs['PGSSLMODE'] : 'disable';
  envs['PGREQUIRESSL'] = envs['PGREQUIRESSL'] ? envs['PGREQUIRESSL'] : '0';
  envs['MINIO_ROOT_USER'] = envs['MINIO_ROOT_USER'] ? envs['MINIO_ROOT_USER'] : 'minioaccesskey';
  envs['MINIO_ROOT_PASSWORD'] = envs['MINIO_ROOT_PASSWORD'] ? envs['MINIO_ROOT_PASSWORD'] : 'miniosecretkey';
  envs['HASURA_STORAGE_DEBUG'] = envs['HASURA_STORAGE_DEBUG'] ? envs['HASURA_STORAGE_DEBUG'] : 'true';
  envs['HASURA_METADATA'] = envs['HASURA_METADATA'] ? envs['HASURA_METADATA'] : '1';
  envs['HASURA_ENDPOINT'] = envs['HASURA_ENDPOINT'] ? envs['HASURA_ENDPOINT'] : 'http://host.docker.internal:8080/v1';
  envs['S3_ENDPOINT'] = envs['S3_ENDPOINT'] ? envs['S3_ENDPOINT'] : 'http://host.docker.internal:9000';
  envs['S3_ACCESS_KEY'] = envs['S3_ACCESS_KEY'] ? envs['S3_ACCESS_KEY'] : 'minioaccesskey';
  envs['S3_SECRET_KEY'] = envs['S3_SECRET_KEY'] ? envs['S3_SECRET_KEY'] : 'miniosecretkey';
  envs['S3_BUCKET'] = envs['S3_BUCKET'] ? envs['S3_BUCKET'] : 'default';
  envs['S3_ROOT_FOLDER'] = envs['S3_ROOT_FOLDER'] ? envs['S3_ROOT_FOLDER'] : 'default';
  envs['POSTGRES_MIGRATIONS'] = envs['POSTGRES_MIGRATIONS'] ? envs['POSTGRES_MIGRATIONS'] : '0';
  envs['POSTGRES_MIGRATIONS_SOURCE'] = envs['POSTGRES_MIGRATIONS_SOURCE'] ? envs['POSTGRES_MIGRATIONS_SOURCE'] : 'postgres://postgres:postgrespassword@host.docker.internal:5432/postgres?sslmode=disable';
  envs['MIGRATIONS_ID_TYPE_SQL'] = envs['MIGRATIONS_ID_TYPE_SQL'] ? envs['MIGRATIONS_ID_TYPE_SQL'] : 'bigint';
  envs['MIGRATIONS_ID_TYPE_GQL'] = envs['MIGRATIONS_ID_TYPE_GQL'] ? envs['MIGRATIONS_ID_TYPE_GQL'] : 'bigint';
  envs['MIGRATIONS_HASURA_SECRET'] = envs['MIGRATIONS_HASURA_SECRET'] ? envs['MIGRATIONS_HASURA_SECRET'] : 'myadminsecretkey';
  envs['DEEPLINKS_HASURA_SECRET'] = envs['DEEPLINKS_HASURA_SECRET'] ? envs['DEEPLINKS_HASURA_SECRET'] : 'myadminsecretkey';
  envs['MIGRATIONS_SCHEMA'] = envs['MIGRATIONS_SCHEMA'] ? envs['MIGRATIONS_SCHEMA'] : 'public';
  envs['MIGRATIONS_RL_TABLE'] = envs['MIGRATIONS_RL_TABLE'] ? envs['MIGRATIONS_RL_TABLE'] : 'rl_example__links__reserved';
  envs['MIGRATIONS_DATE_TYPE_SQL'] = envs['MIGRATIONS_DATE_TYPE_SQL'] ? envs['MIGRATIONS_DATE_TYPE_SQL'] : 'timestamp';
  envs['RESERVED_LIFETIME_MS'] = envs['RESERVED_LIFETIME_MS'] ? envs['RESERVED_LIFETIME_MS'] : 24 * 60 * 60 * 1000;
  // DL may be not in docker, when DC in docker, so we use host.docker.internal instead of docker-network link deep_links_1
  envs['DOCKER_DEEPLINKS_URL'] = envs['DOCKER_DEEPLINKS_URL'] ? envs['DOCKER_DEEPLINKS_URL'] : `http://host.docker.internal:${deeplinksPort}`;
  envs['MIGRATIONS_DIR'] = envs['MIGRATIONS_DIR'] ? envs['MIGRATIONS_DIR'] : `${platform == "win32" ? '' : '/tmp/'}.migrate`;
  if (isGitpod) {
    envs['MIGRATIONS_HASURA_PATH'] = envs['MIGRATIONS_HASURA_PATH'] ? envs['MIGRATIONS_HASURA_PATH'] : +DOCKER ? `deep-hasura:${hasuraPort}` : `$(gp url ${hasuraPort})`;
    envs['DEEPLINKS_HASURA_PATH'] = envs['DEEPLINKS_HASURA_PATH'] ? envs['DEEPLINKS_HASURA_PATH'] : isDeeplinksDocker === 0 ? `$(echo $(gp url ${hasuraPort}) | awk -F[/:] '{print $4}')` : `deep-hasura:${hasuraPort}`;
    envs['MIGRATIONS_HASURA_SSL'] = envs['MIGRATIONS_HASURA_SSL'] ? envs['MIGRATIONS_HASURA_SSL'] : +DOCKER ? '0' : '1';
    envs['DEEPLINKS_HASURA_SSL'] = envs['DEEPLINKS_HASURA_SSL'] ? envs['DEEPLINKS_HASURA_SSL'] : isDeeplinksDocker === 0 ? '1' : '0';
    envs['NEXT_PUBLIC_GQL_SSL'] = envs['NEXT_PUBLIC_GQL_SSL'] ? envs['NEXT_PUBLIC_GQL_SSL'] : '1';
    envs['NEXT_PUBLIC_DEEPLINKS_SERVER'] = envs['NEXT_PUBLIC_DEEPLINKS_SERVER'] ? envs['NEXT_PUBLIC_DEEPLINKS_SERVER'] : `https://$(echo $(gp url ${deepcasePort}) | awk -F[/:] '{print $4}')`;
    envs['NEXT_PUBLIC_GQL_PATH'] = envs['NEXT_PUBLIC_GQL_PATH'] ? envs['NEXT_PUBLIC_GQL_PATH'] : `$(echo $(gp url ${deeplinksPort}) | awk -F[/:] '{print $4}')/gql`;
    envs['NEXT_PUBLIC_ENGINES'] = envs['NEXT_PUBLIC_ENGINES'] ? envs['NEXT_PUBLIC_ENGINES'] : '1';
  } else {
    envs['MIGRATIONS_HASURA_PATH'] = envs['MIGRATIONS_HASURA_PATH'] ? envs['MIGRATIONS_HASURA_PATH'] : +DOCKER ? `deep-hasura:${hasuraPort}` : `localhost:${hasuraPort}`;
    envs['DEEPLINKS_HASURA_PATH'] = envs['DEEPLINKS_HASURA_PATH'] ? envs['DEEPLINKS_HASURA_PATH'] : isDeeplinksDocker === 0 ? `localhost:${hasuraPort}` : `deep-hasura:${hasuraPort}`;
    envs['MIGRATIONS_HASURA_SSL'] = envs['MIGRATIONS_HASURA_SSL'] ? envs['MIGRATIONS_HASURA_SSL'] : '0';
    envs['DEEPLINKS_HASURA_SSL'] = envs['DEEPLINKS_HASURA_SSL'] ? envs['DEEPLINKS_HASURA_SSL'] : '0';
    envs['NEXT_PUBLIC_GQL_SSL'] = envs['NEXT_PUBLIC_GQL_SSL'] ? envs['NEXT_PUBLIC_GQL_SSL'] : '0';
    envs['NEXT_PUBLIC_DEEPLINKS_SERVER'] = envs['NEXT_PUBLIC_DEEPLINKS_SERVER'] ? envs['NEXT_PUBLIC_DEEPLINKS_SERVER'] : `http://localhost:${deepcasePort}`;
    envs['NEXT_PUBLIC_GQL_PATH'] = envs['NEXT_PUBLIC_GQL_PATH'] ? envs['NEXT_PUBLIC_GQL_PATH'] : `localhost:${deeplinksPort}/gql`;
    envs['MIGRATIONS_DEEPLINKS_URL'] = envs['MIGRATIONS_DEEPLINKS_URL'] ? envs['MIGRATIONS_DEEPLINKS_URL'] : isDeeplinksDocker === 0 ? `http://host.docker.internal:${deeplinksPort}` : `http://deep-links:${deeplinksPort}`;
  }
  Object.keys(envs).forEach(k => envsStr += handleEnv(k, envs));
  return envsStr;
};

export const _checkDeeplinksStatus = async (): Promise<ICheckDeeplinksStatusReturn> => {
  let status;
  let err;
  try {
    // DL may be not in docker, when DC in docker, so we use host.docker.internal instead of docker-network link deep_links_1
    status = await axios.get(`${+DOCKER ? 'http://host.docker.internal:3006' : DEEPLINKS_PUBLIC_URL}/api/healthz`, { validateStatus: status => true, timeout: 7000 });
  } catch(e){
    error(e)
    err = e;
  }
  return { result: status?.data?.docker, error: err };
};


export const _checkDeepcaseStatus = async (): Promise<ICheckDeeplinksStatusReturn> => {
  let status;
  let err;
  try {
    // DL may be not in docker, when DC in docker, so we use host.docker.internal instead of docker-network link deep_links_1
    status = await axios.get(`${+DOCKER ? 'http://host.docker.internal:3007' : NEXT_PUBLIC_DEEPLINKS_SERVER}/api/healthz`, { validateStatus: status => true, timeout: 7000 });
  } catch(e){
    error(e)
    err = e;
  }
  return { result: status?.data?.docker, error: err };
};

const _generateEngineStr = ({ operation, isDeeplinksDocker, isDeepcaseDocker, envs }: IGenerateEngineStrOptions): string => {
  let str;
  if (![ 'init', 'migrate', 'check', 'run', 'sleep', 'reset', 'dock', 'compose' ].includes(operation)) return ' echo "not valid operation"';
  if (operation === 'init') {
    str = ` cd "${path.normalize(`${_hasura}/local/`)}" && docker-compose -p deep stop postgres hasura && docker volume create deep-db-data && docker pull deepf/deeplinks:main`;
  }
  if (operation === 'migrate') {
    str = ` cd "${path.normalize(`${_hasura}/local/`)}" && docker run -v ${platform === "win32" ? _deeplinks : '/tmp'}:/migrations -v deep-db-data:/data --rm --name links --entrypoint "sh" deepf/deeplinks:main -c "cd / && tar xf /backup/volume.tar --strip 1 && cp /backup/.migrate /migrations/.migrate"`;
  }
  if (operation === 'check') {
    str = ` cd "${path.normalize(`${_hasura}/local/`)}"  && npm run docker-local && npx -q wait-on --timeout 10000 ${+DOCKER ? `http-get://deep-hasura` : 'tcp'}:8080 && cd "${_deeplinks}" ${isDeeplinksDocker===undefined ? `&& ${ platform === "win32" ? 'set COMPOSE_CONVERT_WINDOWS_PATHS=1&& ' : ''} npm run start-deeplinks-docker && npx -q wait-on --timeout 10000 ${+DOCKER ? 'http-get://host.docker.internal:3006'  : DEEPLINKS_PUBLIC_URL}/api/healthz` : ''}`;
  }
  if (operation === 'run') {
    str = ` cd "${path.normalize(`${_hasura}/local/`)}" && docker-compose -p deep stop postgres hasura && docker volume create deep-db-data && docker pull deepf/deeplinks:main && ${+envs['RESTORE_VOLUME_FROM_SNAPSHOT'] ? `docker run -v ${platform === "win32" ? _deeplinks : '/tmp'}:/migrations -v deep-db-data:/data --rm --name links --entrypoint "sh" deepf/deeplinks:main -c "cd / && tar xf /backup/volume.tar --strip 1 && cp /backup/.migrate /migrations/.migrate" && ` : '' } npm run docker-local && npx -q wait-on --timeout 10000 ${+DOCKER ? `http-get://deep-hasura` : 'tcp'}:8080 && cd "${_deeplinks}" ${isDeeplinksDocker===undefined ? `&& ${ platform === "win32" ? 'set COMPOSE_CONVERT_WINDOWS_PATHS=1&& ' : ''} npm run start-deeplinks-docker && npx -q wait-on --timeout 10000 ${+DOCKER ? 'http-get://host.docker.internal:3006'  : DEEPLINKS_PUBLIC_URL}/api/healthz` : ''} && ( cd ${_deeplinks}/local/deepcase ${ isDeepcaseDocker === undefined ? '&& docker-compose pull && docker-compose -p deep up -d' : '' } )`;
  }
  if (operation === 'sleep') {
    if (platform === "win32") {
      str = ` powershell -command docker stop $(docker ps -a --filter name=deep- -q --format '{{ $a:= false }}{{ $name:= .Names }}{{ range $splited := (split .Names \`"_\`") }}{{ if eq \`"case\`" $splited }}{{$a = true}}{{ end }}{{end}}{{ if eq $a false }}{{ $name }}{{end}}')`;
    } else {
      str = ` docker stop $(docker ps --filter name=deep- -q --format '{{ $a:= false }}{{ range $splited := (split .Names "_") }}{{ if eq "case" $splited }}{{$a = true}}{{ end }}{{ end }}{{ if eq $a false }}{{.ID}}{{end}}')`;
    }
  }
  if (operation === 'reset') {
    if (platform === "win32") {
      str = ` cd "${_deeplinks}" && npx rimraf ${envs['MIGRATIONS_DIR']} && powershell -command docker rm -fv $(docker ps -a --filter name=deep- -q --format '{{ $a:= false }}{{ $name:= .Names }}{{ range $splited := (split .Names \`"-\`") }}{{ if eq \`"case\`" $splited }}{{$a = true}}{{ end }}{{end}}{{ if eq $a false }}{{ $name }}{{end}}'); docker volume rm $(docker volume ls -q --filter name=deep-)${ !+DOCKER ? `; docker network rm $(docker network ls -q -f name=deep-) ` : ''};`;
    } else {
      str = ` cd "${_deeplinks}" && npx rimraf ${envs['MIGRATIONS_DIR']} && (docker rm -fv $(docker ps -a --filter name=deep- -q --format '{{ $a:= false }}{{ range $splited := (split .Names "-") }}{{ if eq "case" $splited }}{{$a = true}}{{ end }}{{ end }}{{ if eq $a false }}{{.ID}}{{end}}') || true) && (docker volume rm $(docker volume ls -q --filter name=deep-) || true)${ !+DOCKER ? ` && (docker network rm $(docker network ls -q -f name=deep-) || true)` : ''}`;
    }
  }
  if (operation === 'dock') {
    str = ` docker version -f '{{json .}}'`;
  }
  if (operation === 'compose') {
    str = ` docker-compose version --short`;
  }
  return str;
}

const _execEngine = async ({ envsStr, engineStr }: { envsStr: string; engineStr: string; } ): Promise<IExecEngineReturn> => {
  try {
    const command = `${envsStr} ${engineStr}`;
    console.log(command);
    const { stdout, stderr } = await execP(command);
    return { result: { stdout, stderr } }
  } catch(e) {
    error(e);
    return { error: e };
  }
}

export async function call (options: ICallOptions) {
  //@ts-ignore
  const envs = { ...options.envs, DOCKERHOST: internalIp.internalIpV4 ? await internalIp.internalIpV4() : internalIp?.v4?.sync() };
  if (platform !== "win32"){
    fixPath();
    envs['PATH'] = `'${process?.env?.['PATH']}'`;
  } else {
    envs['PATH'] = process?.env?.['Path'];
  }
  log({options});
  const isDeeplinksDocker = await _checkDeeplinksStatus();
  const isDeepcaseDocker = await _checkDeepcaseStatus();
  log({isDeeplinksDocker});

  const envsStr = _generateEnvs({ envs, isDeeplinksDocker: isDeeplinksDocker.result });
  log({envs});
  const engineStr = _generateEngineStr({ operation: options.operation, isDeeplinksDocker: isDeeplinksDocker.result, isDeepcaseDocker: isDeepcaseDocker.result, envs} )
  log({engineStr});
  const engine = await _execEngine({ envsStr, engineStr });
  log({engine});

  return { ...options, platform, _hasura, _deeplinks, isDeeplinksDocker, isDeepcaseDocker, envs, engineStr, fullStr: `${envsStr} ${engineStr}`, ...engine };
}
