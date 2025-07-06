import { db } from '../../lib/db';
import { User } from '../../types/auth';
import { generateId } from '../../utils/ids';
import { hashPassword, verifyPassword } from '../../utils/auth';

export const usersDb = {
  create: async (email: string, password: string): Promise<User> => {
    const id = generateId();
    const hashedPassword = await hashPassword(password);

    db.prepare(`
      INSERT INTO users (id, email, password)
      VALUES (?, ?, ?)
    `).run(id, email, hashedPassword);

    return this.getById(id)!;
  },

  getByEmail: (email: string): User | undefined => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  getById: (id: string): User | undefined => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  verifyCredentials: async (email: string, password: string): Promise<User | null> => {
    const user = this.getByEmail(email);
    if (!user) return null;

    const isValid = await verifyPassword(password, user.password);
    return isValid ? user : null;
  }
};