import { addImportJsonCommand } from './commands/import-json.js';
import { Command } from 'commander';
import { addExportJsonCommand } from './commands/export-json.js';
import consola from 'consola';

consola.level = (consola as never)['LogLevel']['Debug'];

const program = new Command();

program
  .name('dynamoman')
  .description('CLI to manage AWS DynamoDB Import & Export')
  .version('0.8.0');

addExportJsonCommand(program);
addImportJsonCommand(program);
program.parse();
