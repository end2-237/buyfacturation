import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI || buildUri();

  await mongoose.connect(uri);
  isConnected = true;
  console.log("✅ MongoDB connecté");
}

function buildUri() {
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
  if (DB_USER && DB_PASSWORD) {
    return `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  }
  return `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}
