const express = require('express');
const WebTorrent = require('webtorrent');

const app = express();
const client = new WebTorrent();

// Route to stream the torrent file
app.get('/stream', (req, res) => {
  const magnetURI = req.query.magnet;
  if (!magnetURI) {
    return res.status(400).send('Missing magnet link');
  }

  // Add the torrent using the provided magnet URI
  client.add(magnetURI, torrent => {
    // Select a file to stream. For example, choose the largest file.
    const file = torrent.files.reduce((a, b) => (a.length > b.length ? a : b));

    // Set appropriate headers. Adjust the Content-Type if necessary.
    res.setHeader('Content-Type', 'video/mp4');

    // Create a read stream from the torrent file and pipe it to the response.
    const stream = file.createReadStream();
    stream.on('error', err => {
      console.error('Stream error:', err);
      res.status(500).end(`Stream error: ${err.message}`);
    });
    stream.pipe(res);
  });
});

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
