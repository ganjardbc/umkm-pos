import { defineStore } from 'pinia';
import { getters } from './getters';

export const useShiftStore = defineStore('shift', {
  getters,
});
