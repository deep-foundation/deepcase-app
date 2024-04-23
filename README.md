[SDK](https://github.com/deep-foundation/sdk) based application, with configured [@deep-foundation/deepcase](https://github.com/deep-foundation/deepcase).

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