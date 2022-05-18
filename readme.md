# dynamoman

CLI to export and import data from AWS DynamoDB

[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/tterb/atomic-design-ui/blob/master/LICENSEs)
![Node](https://img.shields.io/node/v/dynamoman)

## Features

- Easily export the dynamoDB table as JSON
- Imports the data into any dynamoDB table
- Export from one region and import in to another
- Suppors batch import (chunks of 25 records)
- Supports Windows / Linux / Mac

## Installation

You can use npm / yarn to install the cli

```bash
  npm install -g  dynamoman
```

To verify the Installation

```bash
  dynamoman --help
```

## Documentation

## Documentation

### Getting started

To get all details of the CLI use the help option

```
dynamoman --help
```

This will show a help screen

```

    ████████    █████    ██ █████ ███    ███ ██████ ███    ███ █████ ███    ██
    ██   ████  ██ ████   ████   ██████  ██████    ██████  ██████   ██████   ██
    ██   ██ ████  ██ ██  ███████████ ████ ████    ████ ████ ███████████ ██  ██
    ██   ██  ██   ██  ██ ████   ████  ██  ████    ████  ██  ████   ████  ██ ██
    ██████   ██   ██   ██████   ████      ██ ██████ ██      ████   ████   ████


Usage: dynamoman [options] [command]

CLI to manage AWS DynamoDB Import & Export

Options:
  -V, --version             display version
  -h, --help                display help for command

Commands:
  export [options]          export data from an AWS DynamoDB table as JSON file
  import [options]          import data into an AWS DynamoDB table from a JSON file
  help [options] [command]  display help for command
```

To view the help of a particular command use

```bash
dynamoman <command> --help
```

eg:

```bash
dynamoman export --help


Usage: dynamoman export [options]

export data from an AWS DynamoDB table as JSON file

Options:
  --region <aws_region>    Provide the AWS region if you want to overwrite the default one
  --log <log_level>        Log Level to user (choices: "Info", "Debug", "Trace", default: "Info")
  --force                  Forces any confirmation to default yes and proceed
  --file <target_file>     target json file
  --table <table>          Table to export
  --comment <description>  Any comments to include in the export (default: "")
  -h, --help               display help for command
```

### Configure AWS

It is a prerequisite that you should configure the aws using the aws cli `configure` command

```
aws configure
```

Using this command setup the `access key id` and `secret access key`.

| You can also setup the default region during this step.

### Export a table

Inorder to export a table you can use the following command

```
dynamoman export --file output.json --table <mytable>
```

Export options are

| Option                  | Description                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
| --region <aws_region>   | Provide the AWS region if you want to overwrite the default one        |
| --log <log_level>       | Log Level to user (choices: "Info", "Debug", "Trace", default: "Info") |
| --force                 | Forces any confirmation to default yes and proceed                     |
| --file <target_file>    | target json file                                                       |
| --table <table>         | Table to export                                                        |
| --comment <description> | Any comments to include in the export (default: "")                    |

### Import a table

Inorder to import a table you can use the following command

```
dynamoman import --file table_dump.json --table <mytable>
```

Import options are

| Option                | Description                                                            |
| --------------------- | ---------------------------------------------------------------------- |
| --region <aws_region> | Provide the AWS region if you want to overwrite the default one        |
| --log <log_level>     | Log Level to user (choices: "Info", "Debug", "Trace", default: "Info") |
| --file <target_file>  | source json file                                                       |
| --table <table>       | Table to import                                                        |

### Verify the exported JSON file

Inorder to verify an exported json file use the following command

```
dynamoman verify --file table_dump.json
```

Verify options are

| Option               | Description                                                            |
| -------------------- | ---------------------------------------------------------------------- |
| --log <log_level>    | Log Level to user (choices: "Info", "Debug", "Trace", default: "Info") |
| --file <target_file> | source json file                                                       |

## Contributing

Contributions are always welcome!

See `contributing.md` for ways to get started.

Please adhere to this project's `code of conduct`.

## Feedback

If you have any feedback, please reach out to us at fake@fake.com
