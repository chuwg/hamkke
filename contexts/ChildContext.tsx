import React, { createContext, useContext, useEffect, useState } from 'react';
import { Child } from '../types';
import { childrenApi } from '../services/localStorage';

interface ChildContextType {
  children: Child[];
  selectedChild: Child | null;
  loading: boolean;
  selectChild: (child: Child | null) => void;
  refreshChildren: () => Promise<void>;
  addChild: (child: Omit<Child, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<Child>;
  updateChild: (id: string, updates: Partial<Child>) => Promise<Child>;
  deleteChild: (id: string) => Promise<void>;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export function ChildProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshChildren = async () => {
    try {
      setLoading(true);
      const fetchedChildren = await childrenApi.getAll();
      setChildren(fetchedChildren);

      // 첫 번째 자녀를 자동으로 선택
      if (fetchedChildren.length > 0 && !selectedChild) {
        setSelectedChild(fetchedChildren[0]);
      } else if (selectedChild) {
        // 선택된 자녀 정보 업데이트
        const updated = fetchedChildren.find(c => c.id === selectedChild.id);
        if (updated) {
          setSelectedChild(updated);
        } else {
          // 선택된 자녀가 삭제된 경우
          setSelectedChild(fetchedChildren.length > 0 ? fetchedChildren[0] : null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch children:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshChildren();
  }, []);

  const selectChild = (child: Child | null) => {
    setSelectedChild(child);
  };

  const addChild = async (childData: Omit<Child, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    const newChild = await childrenApi.create(childData);
    await refreshChildren();
    setSelectedChild(newChild);
    return newChild;
  };

  const updateChild = async (id: string, updates: Partial<Child>) => {
    const updated = await childrenApi.update(id, updates);
    await refreshChildren();
    return updated;
  };

  const deleteChild = async (id: string) => {
    await childrenApi.delete(id);

    if (selectedChild?.id === id) {
      setSelectedChild(null);
    }

    await refreshChildren();
  };

  const value = {
    children,
    selectedChild,
    loading,
    selectChild,
    refreshChildren,
    addChild,
    updateChild,
    deleteChild,
  };

  return <ChildContext.Provider value={value}>{reactChildren}</ChildContext.Provider>;
}

export function useChild() {
  const context = useContext(ChildContext);
  if (context === undefined) {
    throw new Error('useChild must be used within a ChildProvider');
  }
  return context;
}
