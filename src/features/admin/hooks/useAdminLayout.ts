// useAdminLayout Hook
// This hook could manage layout-specific state like sidebar visibility, mobile menu state, etc.

import { useState } from 'react';

export const useAdminLayout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return { isSidebarCollapsed, setSidebarCollapsed };
};
