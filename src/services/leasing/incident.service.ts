
import { db } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function createIncident(incident: Omit<Incident, 'id'>): Promise<Incident> {
  const now = new Date().toISOString();
  const id = uuidv4();
  db.prepare(`INSERT INTO incidents (id, equipment_id, reported_by, date_reported, description, status, resolution_notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, incident.equipment_id, incident.reported_by, incident.date_reported, incident.description, incident.status, incident.resolution_notes || null, now, now);
  return { ...incident, id, created_at: now, updated_at: now } as Incident;
}

export async function updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
  const now = new Date().toISOString();
  const existing = db.prepare(`SELECT * FROM incidents WHERE id=?`).get(id);
  if (!existing) throw new Error('Incident not found');
  const updated = { ...existing, ...updates, updated_at: now };
  db.prepare(`UPDATE incidents SET equipment_id=?, reported_by=?, date_reported=?, description=?, status=?, resolution_notes=?, updated_at=? WHERE id=?`)
    .run(updated.equipment_id, updated.reported_by, updated.date_reported, updated.description, updated.status, updated.resolution_notes || null, now, id);
  return updated as Incident;
}

export async function deleteIncident(id: string): Promise<void> {
  db.prepare(`DELETE FROM incidents WHERE id=?`).run(id);
}

export async function getIncidentsByEquipment(equipment_id: string): Promise<Incident[]> {
  return db.prepare(`SELECT * FROM incidents WHERE equipment_id=? ORDER BY date_reported DESC`).all(equipment_id) as Incident[];
}

export async function getOpenIncidents(): Promise<Incident[]> {
  return db.prepare(`SELECT * FROM incidents WHERE status IN ('open','in_progress') ORDER BY date_reported DESC`).all() as Incident[];
}
import type { Incident } from '../../types/leasing-asset';
