import { useState, useEffect } from 'react';
import type { Workflow } from '../types/workflow';

const STORAGE_KEY = 'workflows';

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWorkflows(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkflow = async (workflow: Workflow) => {
    try {
      const updatedWorkflows = workflows.some(w => w.id === workflow.id)
        ? workflows.map(w => w.id === workflow.id ? workflow : w)
        : [...workflows, workflow];
      
      setWorkflows(updatedWorkflows);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWorkflows));
      return workflow;
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    try {
      const updatedWorkflows = workflows.filter(w => w.id !== workflowId);
      setWorkflows(updatedWorkflows);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWorkflows));
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  };

  const getWorkflowForProduct = (productId: string) => {
    return workflows.find(workflow => 
      workflow.active && workflow.productIds.includes(productId)
    );
  };

  return {
    workflows,
    loading,
    saveWorkflow,
    deleteWorkflow,
    getWorkflowForProduct
  };
}