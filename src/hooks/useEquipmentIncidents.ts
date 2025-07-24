import { useState, useCallback } from "react";
import { Incident } from "../types/leasing-asset";
import * as incidentService from "../services/api/leasing/incident.service";

export function useEquipmentIncidents(equipmentId?: string) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    if (!equipmentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await incidentService.getIncidentsByEquipment(equipmentId);
      setIncidents(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Erreur lors du chargement des incidents");
      } else {
        setError("Erreur lors du chargement des incidents");
      }
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  const addIncident = useCallback(async (incident: Omit<Incident, "id">) => {
    setLoading(true);
    setError(null);
    try {
      const created = await incidentService.createIncident(incident);
      setIncidents((prev) => [...prev, created]);
      return created;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Erreur lors de l'ajout de l'incident");
        throw e;
      } else {
        setError("Erreur lors de l'ajout de l'incident");
        throw new Error("Erreur lors de l'ajout de l'incident");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIncident = useCallback(async (id: string, updates: Partial<Incident>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await incidentService.updateIncident(id, updates);
      setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
      return updated;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Erreur lors de la mise à jour de l'incident");
        throw e;
      } else {
        setError("Erreur lors de la mise à jour de l'incident");
        throw new Error("Erreur lors de la mise à jour de l'incident");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIncident = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await incidentService.deleteIncident(id);
      setIncidents((prev) => prev.filter((i) => i.id !== id));
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Erreur lors de la suppression de l'incident");
        throw e;
      } else {
        setError("Erreur lors de la suppression de l'incident");
        throw new Error("Erreur lors de la suppression de l'incident");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    incidents,
    loading,
    error,
    fetchIncidents,
    addIncident,
    updateIncident,
    deleteIncident,
  };
}
