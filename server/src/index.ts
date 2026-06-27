import express from "express";
import cors from "cors";
import { songsRouter } from "./routes/songs.js";
import { playlistsRouter } from "./routes/playlists.js";
import { radioRouter } from "./routes/radio.js";
import { searchRouter } from "./routes/search.js";
import { artistsRouter } from "./routes/artists.js";

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/v1/songs', songsRouter);
app.use('/api/v1/playlists', playlistsRouter);
app.use('/api/v1/radio', radioRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/artists', artistsRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
