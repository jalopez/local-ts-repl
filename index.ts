import type { PackageJson } from 'type-fest';
import type { REPLCommand } from 'repl';

import repl from 'pretty-repl';
import path from 'path';
import chalk from 'chalk';
import os from 'os';

export type ReplPrompt = string;
export type ReplContext = Record<string, unknown>;
export type ReplCommands = Record<string, REPLCommand>;
export type ReplBanner = string;

export interface ReplConfig {
  prompt?: ReplPrompt;
  context?: ReplContext;
  commands?: ReplCommands;

  banner?: ReplBanner;
}

const pkgPath = path.join(process.cwd(), 'package.json');
const replrcPath = path.join(process.cwd(), '.repl.ts');

(async () => {
  const pkg: PackageJson = await import(pkgPath);
  const { banner, context, commands, prompt }: ReplConfig = await import(
    replrcPath
  );

  if (banner) {
    console.log(banner);
  } else {
    console.log(chalk.gray(`Running local-repl-ts for ${pkg.name}.`));
  }
  console.log(chalk.gray('..................................'));
  if (context) {
    console.log(
      'Context:',
      chalk.green(Object.keys(context).sort().join(', ')),
    );
  }

  if (commands) {
    console.log(
      'Custom commands:',
      `.${chalk.green(Object.keys(commands).sort().join(', .'))}`,
    );
  }

  const instance = repl.start({
    prompt: prompt ?? `${pkg.name}> `,
    ignoreUndefined: true,
    breakEvalOnSigint: true,
    useGlobal: true,
  });

  instance.setupHistory(`${os.homedir()}/.node_repl_history`, () => {});

  Object.assign(instance.context, context || {});

  if (commands) {
    Object.keys(commands).forEach((key) => {
      instance.defineCommand(key, commands[key]);
    });
  }
})();
