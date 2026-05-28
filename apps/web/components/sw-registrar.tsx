'use client';
import { useEffect } from 'react';
import { quikz as quikzApi } from '@/lib/api';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export function SwRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    navigator.serviceWorker.register('/sw.js').then(async reg => {
      // Check if user has Quikz enabled
      const settings = await quikzApi.getSettings().catch(() => null) as any;
      if (!settings?.enabled) return;

      // Already subscribed?
      const existing = await reg.pushManager.getSubscription();
      if (existing) return;

      // Request permission + subscribe
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const { key } = await quikzApi.getVapidKey().catch(() => ({ key: '' }));
      if (!key) return;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });

      await quikzApi.subscribe(subscription.toJSON()).catch(() => {});
    }).catch(() => {});
  }, []);

  return null;
}
