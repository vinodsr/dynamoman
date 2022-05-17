import { RawJsonFormat } from './../common/raw.json.format.js';
import { Command } from 'commander';
import ora from 'ora';
import { readFile, access } from 'fs/promises';
import consola from 'consola';
import chalk from 'chalk';

/**
 * Adds the verify command action
 * @param program Commander
 */
export const addVerifyJsonCommand = (program: Command) => {
  program
    .command('verify')
    .description('verify an already exported file')
    .requiredOption('--file <file>', 'source json file')
    .action(async (options) => {
      const { file } = options;

      consola.debug(
        `Starting verify using ${JSON.stringify(options, null, 2)}`
      );
      const spinner = ora({
        discardStdin: false,
        text: `Verifying file [${file}]`,
      });

      try {
        await access(file);
      } catch (error) {
        spinner.fail('File not found!');
        spinner.fail('Verify failed!');
        process.exit(0);
      }
      spinner.text = 'Reading file';
      spinner.start();

      const data = await (await readFile(file)).toString();
      const exportedData: RawJsonFormat = JSON.parse(data);

      spinner.succeed(
        `Table: ${chalk.green(exportedData.table)} (${chalk.blue(
          exportedData.region
        )})`
      );
      spinner.succeed(
        `Total record(s): ${chalk.green(exportedData.records.length)}`
      );
      spinner.succeed(
        `Exported on: ${chalk.green(new Date(exportedData.timestamp))}`
      );
      spinner.succeed(
        `Comment: ${
          exportedData.description.length > 0
            ? chalk.green(exportedData.description)
            : chalk.white('Nil')
        }`
      );
      spinner.stop();
      spinner.succeed('Verify completed');
    });
};
