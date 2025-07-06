import { useState, useEffect } from 'react';
import { db } from '../indexedDB';

export function useIndexedDB<T>(storeName: string, indexName?: string, indexValue?: any) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        let result;
        if (indexName && indexValue !== undefined) {
          result = await db.getByIndex<T>(storeName, indexName, indexValue);
        } else {
          result = await db.getAll<T>(storeName);
        }
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [storeName, indexName, indexValue]);

  const addItem = async (item: T) => {
    try {
      await db.add(storeName, item);
      setData(prev => [...prev, item]);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateItem = async (id: string, item: T) => {
    try {
      await db.update(storeName, id, item);
      setData(prev => prev.map(i => (i as any).id === id ? item : i));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await db.delete(storeName, id);
      setData(prev => prev.filter(i => (i as any).id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refresh: () => void loadData()
  };
}