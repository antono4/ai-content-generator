/**
 * Spatial Store - Zustand store for spatial UI state
 */

import { create } from 'zustand';

export const useSpatialStore = create((set, get) => ({
  // Camera state
  cameraPosition: [0, 5, 20],
  cameraTarget: [0, 0, 0],
  zoom: 1,
  
  // Selection state
  selectedNodeId: null,
  hoveredNodeId: null,
  
  // View state
  viewMode: 'explore', // 'explore', 'focus', 'organize'
  gridVisible: true,
  
  // Actions
  setCameraPosition: (position) => set({ cameraPosition: position }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3, zoom)) }),
  
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  hoverNode: (nodeId) => set({ hoveredNodeId: nodeId }),
  clearSelection: () => set({ selectedNodeId: null, hoveredNodeId: null }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),
  
  // Camera controls
  zoomIn: () => set((state) => ({ zoom: Math.min(3, state.zoom + 0.1) })),
  zoomOut: () => set((state) => ({ zoom: Math.max(0.5, state.zoom - 0.1) })),
  
  focusOnNode: (nodeId) => {
    set({ selectedNodeId: nodeId, viewMode: 'focus' });
  },
  
  resetView: () => set({
    cameraPosition: [0, 5, 20],
    cameraTarget: [0, 0, 0],
    zoom: 1,
    viewMode: 'explore',
  }),
}));

export default useSpatialStore;
