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

## restart

### server

```
docker restart deep-case
```

### GitPod

Deep.Case app is started together with Deep.Links and other services in GitPod. So to restart it from GitPod you should do the following:

1. Find terminal there `npm run gitpod-start` command was executed.
![IMG_1490](https://github.com/deep-foundation/deepcase-app/assets/1431904/81ecd4d4-f4d2-4812-8948-0a155347218d)

2. Press `CTRL+C` in terminal to stop a Deep instance (Deep.Links and Deep.Case).
![IMG_1491](https://github.com/deep-foundation/deepcase-app/assets/1431904/39966c49-b8fd-4030-bcac-d8a0e4ff4e17)

3. Press `↑` button on your keyboard to get last executed command.
![IMG_1492](https://github.com/deep-foundation/deepcase-app/assets/1431904/9ef60c58-ca70-43f3-be91-91966d85dddc)

4. Press `Enter` to execute that command again, that will finish restart sequence.
![IMG_1493](https://github.com/deep-foundation/deepcase-app/assets/1431904/56f48dad-d751-44c7-8871-164f824f122b)

## setting icons for electron

put files in public dir and if need change package.json / electron-build ... electron-packager --icon parametr. Use this [manual](https://electron.github.io/electron-packager/main/interfaces/electronpackager.options.html#icon)
