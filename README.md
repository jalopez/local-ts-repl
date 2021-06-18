# local-ts-repl

![CI](https://github.com/jalopez/local-ts-repl/actions/workflows/check.yml/badge.svg)

Local node REPL for TypeScript projects. Run a REPL including the context of your project.
Customize it to have global variables ready to use (DB connections, service calls, etc).
Top level await configured by default.

Note: This project is highly inspired by: [local-repl](https://github.com/sloria/local-repl) but
for TypeScript codebases instead of plain JavaScript. Kudos to [@sloria](https://github.com/sloria)
and all other project contributors.

## Why this project?

Many languages (and mostly web frameworks) provide project-wide REPLs that offer the developer an
easy way to access to local modules within the scope of the project (ready-to-use database connections,
3rd party service calls, etc). Some examples of these tools are _Rails console_, _Django console_,
_Elixir's IEx_, ... However, there is no such thing for Typescript-based Node projects.
This is where `local-ts-repl` fits.

## Installation

Using npm:

```sh
> npm install --save-dev local-ts-repl ts-node typescript
```

Using yarn:

```sh
> yarn add -D local-ts-repl ts-node typescript
```

## Configuration

1. Add a `"repl": "ts-repl"` entry in your `scripts` section of your `package.json`

2. Create a `tsconfig.repl.json` file in your project root with these contents:

```
{
  "extends": "./tsconfig",
  "compilerOptions": {
    "moduleResolution": "node",
    "module": "commonjs",
    "target": "ESNext",
    "noEmit": true
  },
  "ts-node": {
    "ignore": [ "/node_modules/(?!local-ts-repl)" ]
  }
}
```

3. Create an `.repl.ts` where the REPL instance for your project will be configured

## Customizing REPL

`ts-repl` will call the `.repl.ts` file before starting, so you can place any initialisation code
you may want (reading `.env` files, initialise database connections, etc.). Besides,
you may want to export any of this properties in this files, which will be used to customize
the REPL environment:

- `context`: A set of objects, functions, etc that will be added to REPL global variables.
- `commands`: A set of custom commands that will be available via `.command`
- `prompt`: The prompt string to be shown (your project name by default)
- `banner`: Custom banner to be shown before starting the REPL

Example `.repl.ts` file:

```ts
import './initDatabases';

import { MyService } from './services/MyService';

import type {
  ReplPrompt,
  ReplContext,
  ReplCommands,
} from '@product/local-ts-repl';

export const prompt: ReplPrompt = '$> ';

// MyService will be globally available
export const context: ReplContext = {
  MyService,
};

export const commands: ReplCommands = {
  reset_services: {
    help: 'Show cache info',
    async action(param: string) {
      // Actions code
      // NOTE: The action is wrapped by `clearBufferedCommand` and `displayPrompt` calls
      // More info about custom commands at: https://nodejs.org/api/repl.html#repl_replserver_definecommand_keyword_cmd
    },
  },
};
```

When you run it, you will have something like:

```sh
> yarn repl

Running local-repl-ts for my-project.
..................................
Context: MyService
Custom commands: .reset_services
$>

```

## Recipes

Here we can see some `.repl.ts` examples you may grab to start with or get inspired.

### Expose TypeORM database connection to allow querying from console

- `.repl.ts`:

```ts
import type { ReplContext } from 'local-ts-repl';
import { User } from './models/User';
import { repository } from './database';

export const context: ReplContext = {
  User,
  repository,
};
```

- Running `yarn repl`:

```sh
> yarn repl

Running local-repl-ts for my-project.
..................................
Context: User, repository
$> await repository.find();
[{id: 'user-1'}, {id: 'user-2'}]
```

### Show Redux store state in console and allow to dispatch actions

It can be used in frontend projects also!

- `.repl.ts`:

```ts
import type { ReplContext, ReplCommands } from 'local-ts-repl';

import { store } from './store';

// Some initialization code
store.dispatch({ type: '@@INIT' });

export const context: ReplContext = {
  dispatch: store.dispatch,
};

export const commands: ReplCommands = {
  state: {
    help: 'Show store state. A slice may be given as parameter',
    async action(slice: string) {
      const state = store.getState();

      if (slice) {
        console.log(state[slice]);
      } else {
        console.log(state);
      }
    },
  },
};
```

- Running `yarn repl`:

```sh
> yarn repl

Running local-repl-ts for my-project.
..................................
Context: dispatch
Custom commands: .state
$> dispatch({type: 'MY_ACTION', payload: 'payload'});
undefined
$> .state my_slice
{
  value: 'slice value'
}
```

### Initialise Next.js environment and expose external services as global variables

You can avoid repetitive initialization as well.

- `.repl.ts`:

```ts
import type { ReplContext } from 'local-ts-repl';
import { loadEnvConfig } from '@next/env';
import { setConfig } from 'next/config';

import { ExternalService } from './ExternalService';

import config from './next.config';

// Load .env file variables
loadEnvConfig('./', process.env.NODE_ENV !== 'production');

// Sets default Next.js configuration
setConfig(config);

ExternalService.init({ hostname: process.env.EXTERNAL_SERVICE_HOST });

export const context: ReplContext = {
  ExternalService,
};
```

- Running `yarn repl`:

```sh
> yarn repl

Running local-repl-ts for my-project.
..................................
Context: ExternalService
$> process.env.NEXT_PUBLIC_MY_VARIABLE
my_value
$> await ExternalService.fetchData({param: 'value' })
{
  some: 'data'
}
```
