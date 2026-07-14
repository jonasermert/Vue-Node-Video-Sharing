import { JSONFilePreset } from 'lowdb/node';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

mkdirSync(resolve('data'), { recursive: true });

export const db = await JSONFilePreset(resolve('data/app.json'), {
  users: [],
  videos: [],
  nextUserId: 1,
});

export async function save() {
  await db.write();
}
