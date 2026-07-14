import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { mkdirSync, unlinkSync, existsSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { db, testDatabaseConnection } from './db.js';
import { auth, issue, clear } from './auth.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const uploads = resolve('uploads');

mkdirSync(uploads, { recursive: true });

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(uploads, { fallthrough: false }));

const storage = multer.diskStorage({
  destination: uploads,
  filename: (_r, f, cb) =>
    cb(null, `${Date.now()}-${nanoid(8)}${extname(f.originalname) || '.webm'}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_r, f, cb) => cb(null, f.mimetype.startsWith('video/')),
});

const userView = (u) => ({ id: u.id, name: u.name, email: u.email });

const videoView = (v, req) => ({
  id: v.id,
  title: v.title,
  description: v.description,
  createdAt: v.createdAt,
  updatedAt: v.updatedAt,
  videoUrl: `/uploads/${v.filename}`,
  shareUrl: `${req.protocol}://${req.get('host')}/view/${v.id}`,
});

app.post('/api/auth/register', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const password = String(req.body.password || '');

  if (name.length < 2 || !email.includes('@') || password.length < 8) {
    return res.status(422).json({
      message: 'Please provide a valid name, email and a password with at least 8 characters.',
    });
  }

  if (db.data.users.some((u) => u.email === email)) {
    return res.status(409).json({ message: 'This email is already registered.' });
  }

  const user = {
    id: db.data.nextUserId++,
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    createdAt: new Date().toISOString(),
  };

  db.data.users.push(user);
  await save();
  issue(res, user);
  res.status(201).json({ user: userView(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const user = db.data.users.find((u) => u.email === email);

  if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.passwordHash))) {
    return res.status(422).json({ message: 'Invalid email or password.' });
  }

  issue(res, user);
  res.json({ user: userView(user) });
});

app.post('/api/auth/logout', (_req, res) => {
  clear(res);
  res.json({ ok: true });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.data.users.find((u) => u.id === req.userId);
  if (!user) return res.status(401).json({ message: 'User not found' });
  res.json({ user: userView(user) });
});

app.get('/api/videos', auth, (req, res) => {
  const rows = db.data.videos
    .filter((v) => v.userId === req.userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ videos: rows.map((v) => videoView(v, req)) });
});

app.post('/api/videos', auth, upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(422).json({ message: 'Please choose a video.' });
  }

  const title = String(req.body.title || '').trim();
  if (!title) {
    unlinkSync(req.file.path);
    return res.status(422).json({ message: 'A title is required.' });
  }

  const now = new Date().toISOString();
  const video = {
    id: nanoid(14),
    userId: req.userId,
    title,
    description: String(req.body.description || '').trim(),
    filename: req.file.filename,
    mimeType: req.file.mimetype,
    createdAt: now,
    updatedAt: now,
  };

  db.data.videos.push(video);
  await save();
  res.status(201).json({ video: videoView(video, req) });
});

app.get('/api/videos/:id', auth, (req, res) => {
  const v = db.data.videos.find((v) => v.id === req.params.id && v.userId === req.userId);
  if (!v) return res.status(404).json({ message: 'Video not found' });
  res.json({ video: videoView(v, req) });
});

app.patch('/api/videos/:id', auth, async (req, res) => {
  const v = db.data.videos.find((v) => v.id === req.params.id && v.userId === req.userId);
  if (!v) return res.status(404).json({ message: 'Video not found' });

  const title = String(req.body.title || '').trim();
  if (!title) {
    return res.status(422).json({ message: 'A title is required.' });
  }

  v.title = title;
  v.description = String(req.body.description || '').trim();
  v.updatedAt = new Date().toISOString();
  await save();
  res.json({ video: videoView(v, req) });
});

app.delete('/api/videos/:id', auth, async (req, res) => {
  const i = db.data.videos.findIndex((v) => v.id === req.params.id && v.userId === req.userId);
  if (i < 0) return res.status(404).json({ message: 'Video not found' });

  const [v] = db.data.videos.splice(i, 1);
  await save();
  const p = resolve(uploads, v.filename);
  if (existsSync(p)) unlinkSync(p);
  res.json({ ok: true });
});

app.get('/api/public/videos/:id', (req, res) => {
  const v = db.data.videos.find((v) => v.id === req.params.id);
  if (!v) return res.status(404).json({ message: 'Video not found' });
  res.json({ video: videoView(v, req) });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'The video is larger than 500 MB.' });
  }
  res.status(500).json({ message: 'Unexpected server error.' });
});

app.listen(port, () => console.log(`API running at http://localhost:${port}`));
