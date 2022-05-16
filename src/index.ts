import { addImportJsonCommand } from './commands/import-json.js';
import { Command, Option } from 'commander';
import { addExportJsonCommand } from './commands/export-json.js';
import consola from 'consola';
import chalk from 'chalk';
const version = '0.0.1';

class DynamoManRootCommand extends Command {
  createCommand(name: string) {
    const cmd = new Command(name);
    cmd.option(
      '--region <aws_region>',
      'Provide the AWS region if you want to overwrite the default one'
    );
    cmd.addOption(
      new Option('--log <log_level>', 'Log Level to user')
        .default('Info')
        .choices(['Info', 'Debug', 'Trace'])
    );
    cmd.option('--force', 'Forces any confirmation to default yes and proceed');
    return cmd;
  }
}
const program = new DynamoManRootCommand();
program
  .name('dynamoman')
  .description('CLI to manage AWS DynamoDB Import & Export')
  .version(version);

addExportJsonCommand(program);
addImportJsonCommand(program);
program.hook('preAction', (thisCommand, actionCommand) => {
  console.log(`
dynamoman - ${version}
${chalk.whiteBright('https://github.com/vinodsr/dynamoman')}
`);
  const { log } = actionCommand.opts();
  consola.level = (consola as never)['LogLevel'][log];
});
program.parse();
