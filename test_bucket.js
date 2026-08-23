const admin = require('firebase-admin');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
});

const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n').replace(/^"|"$/g, '');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
});

async function testBucket(bucketName) {
  try {
    const bucket = admin.storage().bucket(bucketName);
    const [exists] = await bucket.exists();
    console.log(`Bucket ${bucketName} exists: ${exists}`);
  } catch (error) {
    console.error(`Bucket ${bucketName} error:`, error.message);
  }
}

async function run() {
  const bucket = admin.storage().bucket('psicarlamartinezz.appspot.com');
  console.log('Appspot bucket name:', bucket.name);
  try {
    const [exists] = await bucket.exists();
    console.log(`Appspot bucket exists: ${exists}`);
  } catch (error) {
    console.error(`Appspot bucket error:`, error.message);
  }
}

run();
