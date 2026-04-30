// Supervisor de inactividad del admin que renueva actividad y cierra sesión al expirar.
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ADMIN_ACTIVITY_SYNC_MS,
  ADMIN_IDLE_LIMIT_MS,
  ADMIN_IDLE_STORAGE_KEY,
  ADMIN_LOGIN_PATH,
} from "@/lib/adminSession";

export default function AdminSessionManager() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname?.startsWith("/admin") || pathname === ADMIN_LOGIN_PATH) {
      return;
    }

    let lastSyncAt = 0;
    let loggingOut = false;

    const persistActivity = async (force = false) => {
      const now = Date.now();

      localStorage.setItem(ADMIN_IDLE_STORAGE_KEY, String(now));

      if (!force && now - lastSyncAt < ADMIN_ACTIVITY_SYNC_MS) {
        return;
      }

      lastSyncAt = now;

      try {
        await fetch("/api/admin/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ lastActivity: now }),
          cache: "no-store",
        });
      } catch {
        // Ignore transient network issues; middleware remains the source of truth.
      }
    };

    const closeSession = async () => {
      if (loggingOut) {
        return;
      }

      loggingOut = true;

      try {
        localStorage.removeItem(ADMIN_IDLE_STORAGE_KEY);
        await fetch("/api/admin/session", {
          method: "DELETE",
          cache: "no-store",
        });
      } catch {
        // Ignore and continue with local sign out.
      }

      await supabase.auth.signOut();
      router.replace(`${ADMIN_LOGIN_PATH}?reason=expired`);
      router.refresh();
    };

    const checkIdle = async () => {
      const lastActivity = Number(localStorage.getItem(ADMIN_IDLE_STORAGE_KEY) || "0");

      if (lastActivity && Date.now() - lastActivity > ADMIN_IDLE_LIMIT_MS) {
        await closeSession();
      }
    };

    const onActivity = () => {
      void persistActivity();
    };

    void persistActivity(true);

    const events: Array<keyof WindowEventMap> = [
      "click",
      "keydown",
      "pointerdown",
      "scroll",
      "touchstart",
    ];

    events.forEach((eventName) => {
      window.addEventListener(eventName, onActivity, { passive: true });
    });

    const interval = window.setInterval(() => {
      void checkIdle();
    }, 60 * 1000);

    const onVisibilityChange = () => {
      if (!document.hidden) {
        void checkIdle();
        void persistActivity(true);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, onActivity);
      });
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(interval);
    };
  }, [pathname, router]);

  return null;
}
