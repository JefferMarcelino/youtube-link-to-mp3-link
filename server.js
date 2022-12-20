const express = require('express');
const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs');

const app = express();

app.get('/download', async (req, res) => {
  const { url } = req.query;

  const fileName = `${Date.now()}.mp3`;
  const fileStream = fs.createWriteStream(`downloads/${fileName}`);

  ytdl(url, {
    filter: 'audioonly',
  }).pipe(fileStream);

  fileStream.on('finish', () => {
    res.send({ "mp3": `http://${req.headers.host}/download-file/${fileName}` });

    // Use axios to delete the file after 15 minutes
    setTimeout(() => {
      axios.get(`http://${req.headers.host}/delete-file/${fileName}`)
        .catch((error) => {
          console.error(`Error deleting file: ${error}`);
        });
    }, 15 * 60 * 1000);
  });
});

app.get('/download-file/:fileName', (req, res) => {
  const { fileName } = req.params;

  res.download(`downloads/${fileName}`, () => {
    res.end();
  });
});

app.get('/delete-file/:fileName', (req, res) => {
  const { fileName } = req.params;

  fs.unlink(`downloads/${fileName}`, (err) => {
    if (err) {
      console.error(`Error deleting file: ${err}`);
      return res.sendStatus(500);
    }

    res.sendStatus(200);
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
