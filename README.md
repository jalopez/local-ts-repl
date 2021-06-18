# local-ts-repl

Local node REPL for TypeScript projects. Run a REPL including the context of your project.
Customize it to have global variables ready to use (DB connections, service calls, etc).

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

In your `.repl.ts` file you can export (optionally) one of these properties:

- `prompt`: The prompt string to be shown (your project name by default)
- `banner`: Custom banner to be shown before starting the REPL
- `context`: A set of global objects that will be added to REPL global variables
- `commands`: A set of custom commands that will be available via `.command`

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
    async action() {
      this.clearBufferedCommand();
      // Service initialization
      // ....
      this.displayPrompt();
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

## Recipes & examples

See [examples](./examples) folder
