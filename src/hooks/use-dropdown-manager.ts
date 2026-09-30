import { useState } from 'react';

export const useDropdownManager = (cardId: string) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const openDropdown = (dropdownId: string) => {
    setActiveDropdown(dropdownId);
  };
  
  const closeDropdown = () => {
    setActiveDropdown(null);
  };
  
  const isOpen = (dropdownId: string) => {
    return activeDropdown === dropdownId;
  };
  
  const toggleDropdown = (dropdownId: string) => {
    if (isOpen(dropdownId)) {
      closeDropdown();
    } else {
      openDropdown(dropdownId);
    }
  };
  
  return { openDropdown, closeDropdown, isOpen, toggleDropdown };
};