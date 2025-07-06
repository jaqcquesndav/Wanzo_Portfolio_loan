import { useState, useCallback } from "react";
import { Maintenance } from "../types/leasing-asset";
import * as maintenanceService from "../services/leasing/maintenance.service";

export function useEquipmentMaintenance(equipmentId?: string) {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMaintenances = useCallback(async () => {
    if (!equipmentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.getMaintenancesByEquipment(equipmentId);
      setMaintenances(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Erreur lors du chargement des maintenances");
      } else {
        setError("Erreur lors du chargement des maintenances");
      }
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  const addMaintenance = useCallback(async (maintenance: Omit<Maintenance, "id">) => {
    setLoading(true);
    setError(null);
    try {
      const created = await maintenanceService.createMaintenance(maintenance as Maintenance);
      setMaintenances((prev) => [...prev, created]);
      return created;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Erreur lors de l'ajout de la maintenance");
        throw e;
      } else {
        setError("Erreur lors de l'ajout de la maintenance");
        throw new Error("Erreur lors de l'ajout de la maintenance");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMaintenance = useCallback(async (id: string, updates: Partial<Maintenance>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await maintenanceService.updateMaintenance(id, updates);
      setMaintenances((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Erreur lors de la mise à jour de la maintenance");
        throw e;
      } else {
        setError("Erreur lors de la mise à jour de la maintenance");
        throw new Error("Erreur lors de la mise à jour de la maintenance");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMaintenance = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await maintenanceService.deleteMaintenance(id);
      setMaintenances((prev) => prev.filter((m) => m.id !== id));
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Erreur lors de la suppression de la maintenance");
        throw e;
      } else {
        setError("Erreur lors de la suppression de la maintenance");
        throw new Error("Erreur lors de la suppression de la maintenance");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    maintenances,
    loading,
    error,
    fetchMaintenances,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
  };
}
