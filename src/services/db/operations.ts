import { db } from '../../lib/db';
import { Operation, OperationFormData } from '../../types/operations';
import { generateId } from '../../utils/ids';

export const operationsDb = {
  getAll: (userId: string): Operation[] => {
    return db.prepare(
      'SELECT * FROM operations WHERE user_id = ? ORDER BY created_at DESC'
    ).all(userId);
  },

  getById: (id: string, userId: string): Operation | undefined => {
    return db.prepare(
      'SELECT * FROM operations WHERE id = ? AND user_id = ?'
    ).get(id, userId);
  },

  create: (data: OperationFormData, userId: string): Operation => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO operations (
        id, user_id, type, amount, start_date, end_date, 
        interest_rate, description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, userId, data.type, data.amount, data.startDate,
      data.endDate, data.interestRate, data.description,
      now, now
    );

    return this.getById(id, userId)!;
  },

  update: (id: string, data: OperationFormData, userId: string): Operation => {
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE operations 
      SET type = ?, amount = ?, start_date = ?, end_date = ?,
          interest_rate = ?, description = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      data.type, data.amount, data.startDate, data.endDate,
      data.interestRate, data.description, now, id, userId
    );

    return this.getById(id, userId)!;
  }
};