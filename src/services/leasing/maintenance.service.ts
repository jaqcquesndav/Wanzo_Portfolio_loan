import type { Maintenance } from '../../types/leasing-asset';

import { db } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function createMaintenance(maintenance: Maintenance) {
    const now = new Date().toISOString();
    const id = maintenance.id || uuidv4();
    db.prepare(`INSERT INTO maintenances (id, equipment_id, type, description, scheduled_date, completed_date, status, cost, provider, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, maintenance.equipment_id, maintenance.type, maintenance.description, maintenance.scheduled_date, maintenance.completed_date || null, maintenance.status, maintenance.cost || null, maintenance.provider || null, now, now);
    // Return the full inserted row
    return db.prepare(`SELECT * FROM maintenances WHERE id=?`).get(id) as Maintenance;
}

export async function updateMaintenance(id: string, updates: Partial<Maintenance>) {
    const now = new Date().toISOString();
    // Build dynamic SQL for updates
    const fields = Object.keys(updates).map((key) => `${key}=?`).join(", ");
    const values = Object.values(updates);
    db.prepare(`UPDATE maintenances SET ${fields}, updated_at=? WHERE id=?`)
      .run(...values, now, id);
    // Return the updated row
    return db.prepare(`SELECT * FROM maintenances WHERE id=?`).get(id) as Maintenance;
}

export async function deleteMaintenance(id: string) {
    db.prepare(`DELETE FROM maintenances WHERE id=?`).run(id);
    return { id };
}

export async function getMaintenancesByEquipment(equipment_id: string) {
    return db.prepare(`SELECT * FROM maintenances WHERE equipment_id=? ORDER BY scheduled_date DESC`).all(equipment_id) as Maintenance[];
}

export async function getUpcomingMaintenances() {
    const now = new Date().toISOString();
    return db.prepare(`SELECT * FROM maintenances WHERE scheduled_date > ? AND status IN ('scheduled','in_progress') ORDER BY scheduled_date ASC`).all(now);
}
