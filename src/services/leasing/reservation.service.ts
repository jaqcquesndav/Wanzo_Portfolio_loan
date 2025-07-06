import type { Reservation } from '../../types/leasing-asset';

// CRUD operations for reservations
import { db } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export const ReservationService = {
  create: async (reservation: Reservation) => {
    // Check for conflicts
    const conflicts = await ReservationService.getConflicts(reservation.equipment_id, reservation.start_date, reservation.end_date);
    if (conflicts.length > 0) {
      return { error: 'Conflict detected', conflicts };
    }
    const now = new Date().toISOString();
    const id = reservation.id || uuidv4();
    db.prepare(`INSERT INTO reservations (id, equipment_id, user_id, start_date, end_date, status, created_at, updated_at, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, reservation.equipment_id, reservation.user_id, reservation.start_date, reservation.end_date, reservation.status, now, now, reservation.notes || null);
    return { id };
  },
  update: async (reservation: Reservation) => {
    const now = new Date().toISOString();
    db.prepare(`UPDATE reservations SET equipment_id=?, user_id=?, start_date=?, end_date=?, status=?, updated_at=?, notes=? WHERE id=?`)
      .run(reservation.equipment_id, reservation.user_id, reservation.start_date, reservation.end_date, reservation.status, now, reservation.notes || null, reservation.id);
    return { id: reservation.id };
  },
  delete: async (id: string) => {
    db.prepare(`DELETE FROM reservations WHERE id=?`).run(id);
    return { id };
  },
  getByEquipment: async (equipment_id: string) => {
    return db.prepare(`SELECT * FROM reservations WHERE equipment_id=? ORDER BY start_date DESC`).all(equipment_id);
  },
  getByUser: async (user_id: string) => {
    return db.prepare(`SELECT * FROM reservations WHERE user_id=? ORDER BY start_date DESC`).all(user_id);
  },
  getConflicts: async (equipment_id: string, start: string, end: string) => {
    // Returns reservations that overlap with the given period
    return db.prepare(`SELECT * FROM reservations WHERE equipment_id=? AND status IN ('pending','confirmed') AND NOT (end_date <= ? OR start_date >= ?)`)
      .all(equipment_id, start, end);
  },
};
