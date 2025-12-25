import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("Missing MONGODB_URI")
}

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined
}
const client = new MongoClient(uri)
const clientPromise =
  global.__mongoClientPromise ?? client.connect()

if (process.env.NODE_ENV !== "production") {
  global.__mongoClientPromise = clientPromise
}
export async function getMongoClient() {
  return clientPromise
}
