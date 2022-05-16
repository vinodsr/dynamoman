import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
export const createClient = (region: string) => {
  const dynamoClient = new DynamoDBClient({ region });

  // Create the DynamoDB document client.
  const documentClient = DynamoDBDocumentClient.from(dynamoClient);

  return { dynamoClient, documentClient };
};
