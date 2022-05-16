import { RawJsonFormat } from './../common/raw.json.format.js';
import { createClient } from './../connection/dynamo.js';
import { Command } from 'commander';
import {
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  BatchWriteCommandInput,
  ScanCommandInput,
} from '@aws-sdk/lib-dynamodb';
import _ from 'lodash';
import ora from 'ora';
import { writeFile, readFile } from 'fs/promises';
import consola from 'consola';
import { marshall } from '@aws-sdk/util-dynamodb';

const delay = (time: number) => new Promise((res) => setTimeout(res, time));
export const addImportJsonCommand = (program: Command) => {
  program
    .command('import')
    .description('Import a JSON file')
    .requiredOption('--file <file>', 'source json file')
    .option('--table <table>', 'Table to import')
    .action(async (options) => {
      const { table, file } = options;
      consola.info(`Starting import using ${JSON.stringify(options, null, 2)}`);
      const spinner = ora({
        discardStdin: false,
        text: `Importing table [${table}]`,
      });
      let count = 0;

      spinner.start();

      const data = await (await readFile(file)).toString();
      const exportedData: RawJsonFormat = JSON.parse(data);

      const { documentClient } = createClient('us-west-2');

      try {
        let recordCount = 0;
        const recordToImport = exportedData.records;
        const importChunks = _.chunk(recordToImport, 25);
        const chunkCount = importChunks.length;
        for (const importChunk of importChunks) {
          count++;
          spinner.text = `Importing chunk ${count}/${chunkCount}`;
          recordCount += importChunk.length;
          const putRequests = importChunk.map((data) => {
            return {
              PutRequest: {
                Item: marshall(data),
              },
            };
          });
          const params: BatchWriteItemCommandInput = {
            RequestItems: {},
          };
          if (params.RequestItems) {
            params.RequestItems[table] = putRequests;
          }
          // console.log(JSON.stringify(params, null, 2));
          await documentClient.send(new BatchWriteItemCommand(params));
        }
        // let moreRecords = true;
        // while (moreRecords) {
        //   const data = await documentClient.send(new ScanCommand(params));
        //   if (data.Items) {
        //     exportFormat.records.push(...data.Items);
        //     count += data.Items.length;
        //   }
        //   await delay(1000);
        //   if (typeof data.LastEvaluatedKey != 'undefined') {
        //     params.ExclusiveStartKey = data.LastEvaluatedKey;
        //     spinner.stop();
        //     consola.debug('fetching more data');
        //     spinner.start();
        //   } else {
        //     moreRecords = false;
        //   }
        //  }

        // await writeFile(outFile, JSON.stringify(exportFormat));
        spinner.succeed(`Total records : ${recordCount}`);
        spinner.stop();
        consola.success('Import completed');
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
