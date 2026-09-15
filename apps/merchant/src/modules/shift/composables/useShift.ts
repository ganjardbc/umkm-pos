import { ref, reactive, computed } from 'vue';
import { getUser } from '@/helpers/auth.ts';
import * as shiftApi from '../services/api';

export interface Participant {
  user_id: string;
  user_name: string;
  participant_added_at: string;
  participant_removed_at?: string;
  is_owner: boolean;
  transaction_count: number;
}

export interface Owner {
  id: string;
  name: string;
  user_name?: string;
  username?: string;
}

export interface Currentshift {
  id: string,
  outlet_id: string,
  shift_owner_id: string,
  status: string,
  start_time: string,
  end_time: string,
  participant_count: number,
  total_transactions: number,
  shift_owner: Owner,
  outlet?: {
    id: string,
    name: string,
    slug: string,
  },
  created_at?: string,
  updated_at?: string,
}

export interface Metrics {
  [userId: string]: any;
}

export interface AuditLog {
  id: string;
  shift_id: string;
  action: string;
  user_id: string;
  action_details?: any;
  created_at: string;
}

// Create a singleton state
const shiftState = {
  currentShift: reactive<Currentshift>({
    id: '',
    outlet_id: '',
    shift_owner_id: '',
    status: 'closed',
    start_time: '',
    end_time: '',
    participant_count: 0,
    total_transactions: 0,
    shift_owner: {
      id: '',
      name: '',
      user_name: '',
    },
  }),
  participants: ref<Participant[]>([]),
  metrics: reactive<Metrics>({}),
  auditLogs: ref<AuditLog[]>([]),
  loading: ref(false),
  error: ref(null),
};

export const useShift = () => {
  const loading = ref(false);
  const error = ref(null);

  // State setters
  const setCurrentShift = (shift: any) => {
    Object.assign(shiftState.currentShift, shift);
  };

  const setParticipants = (newParticipants: Participant[]) => {
    shiftState.participants.value = newParticipants;
  };

  const addParticipantToList = (participant: Participant) => {
    shiftState.participants.value.push(participant);
  };

  const removeParticipantFromList = (userId: string) => {
    shiftState.participants.value = shiftState.participants.value.filter((p: Participant) => p.user_id !== userId);
  };

  const setMetrics = ({ userId, metricsData }: any) => {
    shiftState.metrics[userId] = metricsData;
  };

  const setAuditLogs = (logs: AuditLog[]) => {
    shiftState.auditLogs.value = logs;
  };

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading;
  };

  const setError = (err: any) => {
    error.value = err;
  };

  const clearError = () => {
    error.value = null;
  };

  const isShiftClosed = computed(() => {
    const ShiftStatus = {
      OPEN: 'open',
      CLOSED: 'closed'
    };

    return shiftState.currentShift.status === ShiftStatus.CLOSED;
  });

  const isUserOwner = computed(() => {
    const user = getUser();
    if (shiftState.currentShift.shift_owner_id === user?.id) {
      return true;
    }
    return false;
  });

  const isUserInShift = computed(() => {
    if (isShiftClosed.value) {
      return false;
    }

    const user = getUser();
    const findUser = shiftState.participants.value?.find(
      (p: Participant) => p.user_id === user?.id,
    );

    if (findUser !== undefined) {
      return true;
    }

    return false;
  });

  const isUserRemovedFromShift = computed(() => {
    const user = getUser();
    const findUser = shiftState.participants.value?.find(
      (p: Participant) => p.user_id === user?.id && p.participant_removed_at,
    );
    if (findUser !== undefined) {
      return true;
    }
    return false;
  });

  const isShiftUserCanManage = computed(() => {
    if (isUserRemovedFromShift.value || !isUserInShift.value) {
      return false;
    }

    return !isShiftClosed.value;
  });

  // Async actions
  const fetchShift = async (payload: any) => {
    try {
      const { shiftId } = payload || {};
      if (!shiftId) {
        throw new Error('shiftId is required');
      }
      setLoading(true);
      const response = await shiftApi.getDetailShift(shiftId);
      const { data, success } = response?.data || {};
      if (success) {
        setCurrentShift(data);
      }
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchShiftParticipants = async (payload: any) => {
    try {
      const { shiftId } = payload || {};
      if (!shiftId) {
        throw new Error('shiftId is required');
      }
      setLoading(true);
      const response = await shiftApi.getShiftParticipants(shiftId);
      const { data, success } = response?.data || {};
      if (success) {
        setParticipants(data.data || []);
      }
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = async (payload: any) => {
    try {
      const { shiftId, userId } = payload || {};
      if (!shiftId || !userId) {
        throw new Error('shiftId and userId are required');
      }
      setLoading(true);
      const response = await shiftApi.addParticipant(shiftId, { user_id: userId });
      const { data, success } = response?.data || {};
      if (success) {
        addParticipantToList(data);
      }
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeParticipant = async (payload: any) => {
    try {
      const { shiftId, userId } = payload || {};
      if (!shiftId || !userId) {
        throw new Error('shiftId and userId are required');
      }
      setLoading(true);
      const response = await shiftApi.removeParticipant(shiftId, userId);
      const { success } = response?.data || {};
      if (success) {
        removeParticipantFromList(userId);
      }
      return success;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const restoreParticipant = async (payload: any) => {
    try {
      const { shiftId, userId } = payload || {};
      if (!shiftId || !userId) {
        throw new Error('shiftId and userId are required');
      }
      setLoading(true);
      const response = await shiftApi.restoreParticipant(shiftId, userId);
      const { data, success } = response?.data || {};
      if (success) {
        addParticipantToList(data);
      }
      return success;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handoffShift = async (payload: any) => {
    try {
      const { shiftId, targetUserId, removePreviousOwner } = payload || {};
      if (!shiftId || !targetUserId) {
        throw new Error('shiftId and targetUserId are required');
      }
      setLoading(true);
      const response = await shiftApi.handoffShift(shiftId, {
        target_user_id: targetUserId,
        remove_previous_owner: removePreviousOwner,
      });
      const { data, success } = response?.data || {};
      if (success) {
        setCurrentShift(data);
      }
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantMetrics = async (payload: any) => {
    try {
      const { shiftId, userId } = payload || {};
      if (!shiftId || !userId) {
        throw new Error('shiftId and userId are required');
      }
      setLoading(true);
      const response = await shiftApi.getParticipantMetrics(shiftId, userId);
      const { data, success } = response?.data || {};
      if (success) {
        setMetrics({ userId, metricsData: data });
      }
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async (payload: any) => {
    try {
      const { shiftId, limit = 50, offset = 0 } = payload || {};
      if (!shiftId) {
        throw new Error('shiftId is required');
      }
      setLoading(true);
      const response = await shiftApi.getShiftAuditLog(shiftId, { limit, offset });
      const { data, success } = response?.data || {};
      if (success) {
        setAuditLogs(data.data || []);
      }
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    currentShift: shiftState.currentShift,
    participants: shiftState.participants,
    metrics: shiftState.metrics,
    auditLogs: shiftState.auditLogs,
    loading,
    error,
    isShiftClosed,
    isUserOwner,
    isUserInShift,
    isUserRemovedFromShift,
    isShiftUserCanManage,
    // Actions
    fetchShift,
    fetchShiftParticipants,
    addParticipant,
    removeParticipant,
    restoreParticipant,
    handoffShift,
    fetchParticipantMetrics,
    fetchAuditLogs,
    // Utilities
    clearError,
  };
};
