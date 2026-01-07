import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'en-buddy-playground';
const STORAGE_VERSION = 1;
const MAX_RECORDS = 50;

const getInitialState = () => ({
  version: STORAGE_VERSION,
  records: [],
  currentRecordId: null,
});

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getInitialState();

    const parsed = JSON.parse(stored);
    if (parsed.version !== STORAGE_VERSION) {
      return getInitialState();
    }
    return parsed;
  } catch {
    return getInitialState();
  }
};

/**
 * Hook for managing playground analysis history in localStorage
 */
export function usePlaygroundHistory() {
  const [state, setState] = useState(loadFromStorage);

  // Persist to localStorage on state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const records = state.records;
  const currentRecord = state.records.find((r) => r.id === state.currentRecordId) || null;

  const saveRecord = useCallback((newRecord) => {
    const id = Date.now().toString();
    const firstLine = newRecord.chatHistory.split('\n')[0] || '';
    const record = {
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: firstLine.slice(0, 50) || '未命名分析',
      chatHistory: newRecord.chatHistory,
      analysis: newRecord.analysis,
      takeaway: null,
    };

    setState((prev) => ({
      ...prev,
      records: [record, ...prev.records].slice(0, MAX_RECORDS),
      currentRecordId: id,
    }));

    return id;
  }, []);

  const selectRecord = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      currentRecordId: id,
    }));
  }, []);

  const deleteRecord = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      records: prev.records.filter((r) => r.id !== id),
      currentRecordId: prev.currentRecordId === id ? null : prev.currentRecordId,
    }));
  }, []);

  const updateTakeaway = useCallback((id, takeaway) => {
    setState((prev) => ({
      ...prev,
      records: prev.records.map((r) =>
        r.id === id ? { ...r, takeaway, updatedAt: new Date().toISOString() } : r
      ),
    }));
  }, []);

  const updateRecord = useCallback((id, updates) => {
    setState((prev) => ({
      ...prev,
      records: prev.records.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    }));
  }, []);

  const clearCurrentRecord = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentRecordId: null,
    }));
  }, []);

  const clearAllRecords = useCallback(() => {
    setState(getInitialState());
  }, []);

  return {
    records,
    currentRecord,
    saveRecord,
    selectRecord,
    deleteRecord,
    updateTakeaway,
    updateRecord,
    clearCurrentRecord,
    clearAllRecords,
  };
}
