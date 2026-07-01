import { ref } from 'vue';
import { io, Socket } from 'socket.io-client';
import { getToken, getOutlet } from '@/helpers/auth.ts';
import { useNotificationStore } from '@/modules/notification/stores/index.ts';

const socket = ref<Socket | null>(null);

export function useSocket() {
  const connectSocket = () => {
    if (socket.value?.connected) {
      return;
    }

    const token = getToken();
    if (!token) {
      return;
    }

    const activeOutlet = getOutlet();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

    // Strip trailing slash if present in base URL
    const url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    socket.value = io(`${url}/notifications`, {
      auth: {
        token,
        outlet_id: activeOutlet?.id,
      },
      transports: ['websocket'],
    });

    socket.value.on('connect', () => {
      console.log('🔔 Notifications WebSocket connected');
    });

    socket.value.on('new_notification', (data: any) => {
      console.log('🔔 New notification received:', data);
      const notificationStore = useNotificationStore();
      notificationStore.addNotification(data);
      playNotificationSound();
    });

    socket.value.on('disconnect', () => {
      console.log('🔔 Notifications WebSocket disconnected');
    });
  };

  const disconnectSocket = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
  };

  const playNotificationSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      
      const playBeep = (delay: number, frequency: number, duration: number) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + delay);
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
        
        oscillator.start(audioCtx.currentTime + delay);
        oscillator.stop(audioCtx.currentTime + delay + duration);
      };

      // Play double chime
      playBeep(0, 783.99, 0.15); // G5
      playBeep(0.12, 1046.5, 0.25); // C6
    } catch (e) {
      console.warn('Browser blocks audio until interaction or context creation error:', e);
    }
  };

  return {
    socket,
    connectSocket,
    disconnectSocket,
    playNotificationSound,
  };
}
