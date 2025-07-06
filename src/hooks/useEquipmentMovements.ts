import { useState, useCallback } from "react";
import { EquipmentMovement } from "../types/leasing-asset";
import * as movementService from "../services/leasing/movement.service";

export function useEquipmentMovements(equipmentId?: string) {
  const [movements, setMovements] = useState<EquipmentMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async () => {
    if (!equipmentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await movementService.getMovementsByEquipment(equipmentId);
      setMovements(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Erreur lors du chargement des mouvements");
      } else {
        setError("Erreur lors du chargement des mouvements");
      }
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  const addMovement = useCallback(async (movement: Omit<EquipmentMovement, "id">) => {
    setLoading(true);
    setError(null);
    try {
      const created = await movementService.createMovement(movement);
      setMovements((prev) => [...prev, created]);
      return created;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Erreur lors de l'ajout du mouvement");
        throw e;
      } else {
        setError("Erreur lors de l'ajout du mouvement");
        throw new Error("Erreur lors de l'ajout du mouvement");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMovement = useCallback(async (id: string, updates: Partial<EquipmentMovement>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await movementService.updateMovement(id, updates);
      if (updated) {
        setMovements((prev) => prev.map((m) => (m.id === id ? updated : m)));
      }
      return updated;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Erreur lors de la mise à jour du mouvement");
        throw e;
      } else {
        setError("Erreur lors de la mise à jour du mouvement");
        throw new Error("Erreur lors de la mise à jour du mouvement");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMovement = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await movementService.deleteMovement(id);
      setMovements((prev) => prev.filter((m) => m.id !== id));
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Erreur lors de la suppression du mouvement");
        throw e;
      } else {
        setError("Erreur lors de la suppression du mouvement");
        throw new Error("Erreur lors de la suppression du mouvement");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    movements,
    loading,
    error,
    fetchMovements,
    addMovement,
    updateMovement,
    deleteMovement,
  };
}
