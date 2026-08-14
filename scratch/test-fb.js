const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
console.log("admin.cert:", typeof admin.cert);
console.log("getFirestore:", typeof getFirestore);
console.log("admin.firestore:", typeof admin.firestore);
