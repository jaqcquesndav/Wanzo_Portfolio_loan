import type { EquipmentMovement } from '../../types/leasing-asset';

import { db } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function createMovement(movement: Omit<EquipmentMovement, 'id'>) {
  const now = new Date().toISOString();
  const id = uuidv4();
  db.prepare(`INSERT INTO equipment_movements (id, equipment_id, type, date, from_location, to_location, user_id, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, movement.equipment_id, movement.type, movement.date, movement.from_location || null, movement.to_location || null, movement.user_id || null, movement.notes || null, now, now);
  return db.prepare(`SELECT * FROM equipment_movements WHERE id=?`).get(id) as EquipmentMovement;
}

export async function updateMovement(id: string, updates: Partial<EquipmentMovement>) {
  const now = new Date().toISOString();
  const fields = Object.keys(updates).map((key) => `${key}=?`).join(', ');
  const values = Object.values(updates);
  if (!fields) return null;
  db.prepare(`UPDATE equipment_movements SET ${fields}, updated_at=? WHERE id=?`)
    .run(...values, now, id);
  return db.prepare(`SELECT * FROM equipment_movements WHERE id=?`).get(id) as EquipmentMovement;
}

export async function deleteMovement(id: string) {
  db.prepare(`DELETE FROM equipment_movements WHERE id=?`).run(id);
  return { id };
}

export async function getMovementsByEquipment(equipment_id: string) {
  return db.prepare(`SELECT * FROM equipment_movements WHERE equipment_id=? ORDER BY date DESC`).all(equipment_id) as EquipmentMovement[];
}

export async function getMovementsByType(type: string) {
  return db.prepare(`SELECT * FROM equipment_movements WHERE type=? ORDER BY date DESC`).all(type) as EquipmentMovement[];
}
