import { useEffect, useState } from 'react';

export function useFormDirty<T>(initialData: T, currentData: T) {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const isDataChanged = JSON.stringify(initialData) !== JSON.stringify(currentData);
    setIsDirty(isDataChanged);
  }, [initialData, currentData]);

  return isDirty;
}