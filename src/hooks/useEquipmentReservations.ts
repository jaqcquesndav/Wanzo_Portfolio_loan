import { useState, useEffect } from 'react';
import type { Reservation } from "../types/leasing-asset";
import { ReservationService } from "../services/api/leasing/reservation.service";

export function useEquipmentReservations(equipmentId: string) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const res = await ReservationService.getByEquipment(equipmentId);
        setReservations(Array.isArray(res) ? (res as Reservation[]) : []);
      } catch {
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };
    if (equipmentId) fetchReservations();
  }, [equipmentId]);

  const createReservation = async (reservation: Reservation) => {
    await ReservationService.create(reservation);
    setReservations(prev => [...prev, reservation]);
  };

  const updateReservation = async (reservation: Reservation) => {
    await ReservationService.update(reservation);
    setReservations(prev => prev.map(r => r.id === reservation.id ? reservation : r));
  };

  const deleteReservation = async (id: string) => {
    await ReservationService.delete(id);
    setReservations(prev => prev.filter(r => r.id !== id));
  };

  return { reservations, loading, createReservation, updateReservation, deleteReservation };
}
