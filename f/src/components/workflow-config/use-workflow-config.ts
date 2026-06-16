import { useCallback } from 'react';

/**
 * Shared hook for managing workflow node configuration
 * Provides a consistent way to save config data across all config components
 */
export function useWorkflowConfig(
  node: any,
  onConfigChange?: (config: any) => void
) {
  /**
   * Save configuration data to the node
   * Merges new config with existing config
   */
  const saveConfig = useCallback(
    (updates: Partial<any>) => {
      if (!onConfigChange) return;

      const currentConfig = node?.data?.config || {};
      const newConfig = {
        ...currentConfig,
        ...updates
      };
      onConfigChange(newConfig);
    },
    [node, onConfigChange]
  );

  /**
   * Get current configuration value
   */
  const getConfig = useCallback(
    (key: string, defaultValue?: any) => {
      const config = node?.data?.config || {};
      return config[key] !== undefined ? config[key] : defaultValue;
    },
    [node]
  );

  return {
    saveConfig,
    getConfig,
    currentConfig: node?.data?.config || {}
  };
}
