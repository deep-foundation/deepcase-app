# deep-foundation deepcase-app

[![Gitpod](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/deep-foundation/deepcase-app) 
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label&color=purple)](https://discord.gg/deep-foundation)

## envs

```
export MIGRATIONS_HASURA_PATH=localhost:8080;
export MIGRATIONS_HASURA_SSL=0;
export MIGRATIONS_HASURA_SECRET=myadminsecretkey;

export NEXT_PUBLIC_DEEPLINKS_SERVER=http://localhost:3007;
export NEXT_PUBLIC_GQL_PATH=localhost:3006/gql;
export NEXT_PUBLIC_GQL_SSL=0;

export NEXT_PUBLIC_ENGINES=1;

export JWT_SECRET=<?>;
```

## dev server

```
npm ci
npm run dev -- -p 3007
```

## prod server

```
npm ci
npm run build
npm run start
```

## run electron dev
(renderer client builded, not dev)

```
cross-env ASSET_PREFIX='.' npm run build;
npm run export;
npx cap copy electron; npx cap open electron;
```

## restart deepcase-app

On server:

```
docker restart deep-case
```

In GitPod:



## setting icons for electron

put files in public dir and if need change package.json / electron-build ... electron-packager --icon parametr. Use this [manual](https://electron.github.io/electron-packager/main/interfaces/electronpackager.options.html#icon)
