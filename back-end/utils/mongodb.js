const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config();
const uri = process.env.MONGODB_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDatabase() {
  // Ensure the client is connected
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db('HSGSHackathon24');
}

module.exports = { connectToDatabase };