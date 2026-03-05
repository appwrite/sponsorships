/**
 * @imagine-readonly
 * These should only be imported in server-side actions (SSR, functions).
 */

import { Client, Account, Storage, Avatars, Users } from 'node-appwrite'

const getAppwriteClientCredentials = () => {
  const endpoint = process.env.APPWRITE_ENDPOINT
  if (!endpoint) {
    throw new Error('APPWRITE_ENDPOINT is not set')
  }

  const projectId = process.env.APPWRITE_PROJECT_ID
  if (!projectId) {
    throw new Error('APPWRITE_PROJECT_ID is not set')
  }

  const apiKey = process.env.APPWRITE_API_KEY
  if (!apiKey) {
    throw new Error('APPWRITE_API_KEY is not set')
  }

  return {
    endpoint,
    projectId,
    apiKey,
  }
}

export async function createSessionClient(session: string) {
  const { endpoint, projectId } = getAppwriteClientCredentials()
  const client = new Client().setEndpoint(endpoint).setProject(projectId)
  client.setSession(session)

  return {
    client: client,
    account: new Account(client),
    users: new Users(client),
    storage: new Storage(client),
  }
}

export function createAdminClient(): {
  client: Client
  account: Account
  avatars: Avatars
} {
  const { endpoint, projectId, apiKey } = getAppwriteClientCredentials()
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey)

  return {
    client: client,
    account: new Account(client),
    avatars: new Avatars(client),
  }
}
