import express from 'express';
import cors from 'cors';
import songsRouter from './routes/songs.js';
import playlistsRouter from './routes/playlists.js';
import searchRouter from './routes/search.js';
import artistsRouter from './routes/artists.js';
import { aiRouter } from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 9091;

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/v1/songs', songsRouter);
app.use('/api/v1/playlists', playlistsRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/artists', artistsRouter);
app.use('/api/v1/ai', aiRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
