const https = require('https');

https.get('https://api.telegram.org/bot8942574262:AAEW0R6m90r4ILWsfEionTfxGOok8WWbSlk/getUpdates', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data);
  });
}).on('error', err => {
  console.log("Error: ", err.message);
});
