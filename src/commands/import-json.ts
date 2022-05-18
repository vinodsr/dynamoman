import { RawJsonFormat } from './../common/raw.json.format.js';
import { createClient } from './../connection/dynamo.js';
import { Command } from 'commander';
import {
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import _ from 'lodash';
import ora from 'ora';
import { readFile, access } from 'fs/promises';
import consola from 'consola';
import chalk from 'chalk';

/**
 * Adds the import command action
 * @param program Commander
 */
export const addImportJsonCommand = (program: Command) => {
  program
    .command('import')
    .description('import data into an AWS DynamoDB table from a JSON file')
    .requiredOption('--file <file>', 'Source json file')
    .option('--table <table>', 'Table to import')
    .action(async (options) => {
      const { table, file, region: regionArg } = options;
      const region = regionArg || null;

      consola.debug(
        `Starting import using ${JSON.stringify(options, null, 2)}`
      );
      const spinner = ora({
        discardStdin: false,
        text: `Importing table [${table}]`,
      });
      let count = 0;

      try {
        await access(file);
      } catch (error) {
        spinner.fail('File not found!');
        spinner.fail('Importing failed!');
        process.exit(0);
      }
      spinner.text = 'Reading file';
      spinner.start();
      const startTime = new Date().getTime();

      const data = await (await readFile(file)).toString();
      const exportedData: RawJsonFormat = JSON.parse(data);

      const { documentClient } = createClient(region);

      try {
        let recordCount = 0;
        const recordToImport = exportedData.records;
        const importChunks = _.chunk(recordToImport, 25);
        const chunkCount = importChunks.length;
        spinner.succeed(
          `Created ${chunkCount} chunks for ${recordToImport.length} records`
        );
        spinner.start();
        for (const importChunk of importChunks) {
          count++;
          spinner.text = `Importing chunk ${count}/${chunkCount}`;
          recordCount += importChunk.length;
          const putRequests = importChunk.map((data) => {
            return {
              PutRequest: {
                Item: data,
              },
            };
          });
          const params: BatchWriteItemCommandInput = {
            RequestItems: {},
          };
          if (params.RequestItems) {
            params.RequestItems[table] = putRequests as never;
          }
          await documentClient.send(new BatchWriteItemCommand(params));
        }

        const timeInSec =
          Math.round(((new Date().getTime() - startTime) / 1000) * 100) / 100;
        spinner.succeed(
          `Total record(s): ${chalk.green(
            recordCount
          )} | Took: ${chalk.blueBright(timeInSec)} second(s)`
        );
        spinner.stop();
        spinner.succeed('Import completed');
      } catch (e: unknown) {
        const error = e as Error;
        spinner.fail('Exporting failed');
        if (error.name === 'ResourceNotFoundException') {
          spinner.fail('Table not found!');
        } else {
          spinner.fail(error.message);
          console.log(error.stack);
        }
      }
    });
};
