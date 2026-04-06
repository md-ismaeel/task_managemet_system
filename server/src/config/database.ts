import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Task } from '../entity/Task';
import { RefreshToken } from '../entity/RefreshToken';
import * as fs from 'fs';
import * as path from 'path';

const DB_PATH = path.join(__dirname, '../../data/app.db');
const DB_DIR = path.dirname(DB_PATH);

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const AppDataSource = new DataSource({
  type: 'sqljs',
  location: DB_PATH,
  autoSave: true,
  entities: [User, Task, RefreshToken],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  driver: require('sql.js'),
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected (SQLite via sql.js)');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
