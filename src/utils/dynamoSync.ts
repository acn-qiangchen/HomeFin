import { fetchAuthSession } from 'aws-amplify/auth';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { FinanceState } from '../types';

const REGION = 'ap-northeast-1';
const TABLE = 'HomeFin';
const SK = 'STATE';

async function getClient(): Promise<DynamoDBDocumentClient> {
  const session = await fetchAuthSession();
  const { accessKeyId, secretAccessKey, sessionToken } =
    session.credentials!;
  const raw = new DynamoDBClient({
    region: REGION,
    credentials: { accessKeyId, secretAccessKey, sessionToken },
  });
  return DynamoDBDocumentClient.from(raw);
}

export async function loadFromDynamo(userId: string): Promise<FinanceState | null> {
  try {
    const client = await getClient();
    const res = await client.send(new GetCommand({
      TableName: TABLE,
      Key: { userId, sk: SK },
    }));
    if (!res.Item?.data) return null;
    return JSON.parse(res.Item.data as string) as FinanceState;
  } catch (err) {
    console.error('DynamoDB load error:', err);
    return null;
  }
}

export async function saveToDynamo(userId: string, state: FinanceState): Promise<void> {
  try {
    const client = await getClient();
    await client.send(new PutCommand({
      TableName: TABLE,
      Item: {
        userId,
        sk: SK,
        data: JSON.stringify(state),
        updatedAt: new Date().toISOString(),
      },
    }));
  } catch (err) {
    console.error('DynamoDB save error:', err);
  }
}
