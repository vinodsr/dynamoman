import { RawJsonFormat } from './../common/raw.json.format.js';
import { createClient } from './../connection/dynamo.js';
import { Command } from 'commander';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { ScanCommandInput } from '@aws-sdk/lib-dynamodb';

import ora from 'ora';
import { writeFile, access } from 'fs/promises';
import consola from 'consola';
import inquirer from 'inquirer';
import chalk from 'chalk';

const delay = (time: number) => new Promise((res) => setTimeout(res, time));
export const addExportJsonCommand = (program: Command) => {
  program
    .command('export')
    .description('export data from an AWS DynamoDB table as JSON file')
    .requiredOption('--file <target_file>', 'target json file')
    .option('--table <table>', 'Table to export')
    .option(
      '--comment <description>',
      'Any comments to include in the export',
      ''
    )
    .action(async (options) => {
      const {
        table,
        file: outFile,
        comment,
        region: regionArg,
        force,
      } = options;
      const region = regionArg || null;
      consola.debug(
        `Starting export using ${JSON.stringify(options, null, 2)}`
      );
      const spinner = ora({
        discardStdin: false,
        text: `Exporting table [${table}]`,
      });

      spinner.info(`Exporting table [${table}]`);

      // Check if the file is existing ?
      if (!force) {
        try {
          await access(outFile);
          // ask for overwrite
          const result = await inquirer.prompt([
            {
              type: 'confirm',
              message: 'File already exist ! Overwrite ?',
              name: 'shouldContinue',
            },
          ]);
          if (!result.shouldContinue) {
            spinner.fail('File already exist!');
            spinner.fail('Exporting failed!');
            process.exit(0);
          }
        } catch (error) {
          // fINE ..file doesn't exists
        }
      }

      let count = 0;
      const exportFormat: RawJsonFormat = {
        records: [],
        timestamp: new Date().toISOString(),
        description: comment,
        table: table,
      };
      spinner.start();
      const startTime = new Date().getTime();
      const { documentClient } = createClient(region);
      const params: ScanCommandInput = {
        TableName: table,
      };
      try {
        let moreRecords = true;
        while (moreRecords) {
          const data = await documentClient.send(new ScanCommand(params));
          if (data.Items) {
            exportFormat.records.push(...data.Items);
            count += data.Items.length;
          }
          await delay(1000);
          if (typeof data.LastEvaluatedKey != 'undefined') {
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            spinner.stop();
            consola.debug('fetching more data');
            spinner.start();
          } else {
            moreRecords = false;
          }
        }

        await writeFile(outFile, JSON.stringify(exportFormat));
        const timeInSec =
          Math.round(((new Date().getTime() - startTime) / 1000) * 100) / 100;

        spinner.succeed(
          `Created: ${chalk.whiteBright(
            outFile
          )} | Total record(s): ${chalk.green(
            count
          )} | Took: ${chalk.blueBright(timeInSec)} second(s)`
        );
        spinner.stop();
        spinner.succeed('Export completed');
      } catch (e: unknown) {
        const error = e as Error;
        if (error.name === 'ResourceNotFoundException') {
          spinner.fail('Table not found!');
        } else {
          spinner.fail(error.message);
        }
        spinner.fail('Exporting failed!');
      }
    });
};
