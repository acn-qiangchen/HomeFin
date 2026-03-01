import { fetchAuthSession } from 'aws-amplify/auth';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { FinanceState } from '../types';

const REGION = 'ap-northeast-1';
const TABLE = 'HomeFin';
const SK = 'STATE';

interface SessionData {
  client: DynamoDBDocumentClient;
  // identityId matches the IAM condition ${cognito-identity.amazonaws.com:sub}
  identityId: string;
}

async function getSession(): Promise<SessionData> {
  const session = await fetchAuthSession();
  const { accessKeyId, secretAccessKey, sessionToken } = session.credentials!;
  const identityId = session.identityId!;
  const raw = new DynamoDBClient({
    region: REGION,
    credentials: { accessKeyId, secretAccessKey, sessionToken },
  });
  return { client: DynamoDBDocumentClient.from(raw), identityId };
}

export async function loadFromDynamo(): Promise<FinanceState | null> {
  try {
    const { client, identityId } = await getSession();
    const res = await client.send(new GetCommand({
      TableName: TABLE,
      Key: { userId: identityId, sk: SK },
    }));
    if (!res.Item?.data) return null;
    return JSON.parse(res.Item.data as string) as FinanceState;
  } catch (err) {
    console.error('DynamoDB load error:', err);
    return null;
  }
}

export async function saveToDynamo(state: FinanceState): Promise<void> {
  try {
    const { client, identityId } = await getSession();
    await client.send(new PutCommand({
      TableName: TABLE,
      Item: {
        userId: identityId,
        sk: SK,
        data: JSON.stringify(state),
        updatedAt: new Date().toISOString(),
      },
    }));
  } catch (err) {
    console.error('DynamoDB save error:', err);
  }
}
