import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import type { Portfolio } from '../types/portfolio';
import type { FinancialProduct } from '../types/traditional-portfolio';
import { useNotification } from '../contexts/NotificationContext';

export function useTraditionalPortfolio(id: string) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const loadPortfolio = () => {
      setLoading(true);
      try {
        const portfolios = storage.getPortfolios();
        const found = portfolios.find(p => p.id === id);
        setPortfolio(found || null);
      } catch (error) {
        console.error('Error loading portfolio:', error);
        showNotification('Erreur lors du chargement du portefeuille', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [id]);

  const addProduct = async (productData: Partial<FinancialProduct>) => {
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }
    
    try {
      const newProduct: FinancialProduct = {
        id: Math.random().toString(36).substr(2, 9),
        name: productData.name || '',
        type: productData.type || 'credit',
        description: productData.description || '',
        minAmount: productData.minAmount || 0,
        maxAmount: productData.maxAmount || 0,
        duration: productData.duration || { min: 0, max: 0 },
        interestRate: productData.interestRate || { type: 'fixed', value: 0 },
        requirements: productData.requirements || [],
        isPublic: productData.isPublic || false,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const updatedPortfolio = {
        ...portfolio,
        products: [...portfolio.products, newProduct],
        updated_at: new Date().toISOString()
      };
      
      storage.updatePortfolio(updatedPortfolio);
      setPortfolio(updatedPortfolio);
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (updatedProduct: FinancialProduct) => {
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    try {
      const updatedPortfolio = {
        ...portfolio,
        products: portfolio.products.map(p => 
          p.id === updatedProduct.id ? updatedProduct : p
        ),
        updated_at: new Date().toISOString()
      };

      storage.updatePortfolio(updatedPortfolio);
      setPortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  return { 
    portfolio, 
    loading,
    addProduct,
    updateProduct
  };
}