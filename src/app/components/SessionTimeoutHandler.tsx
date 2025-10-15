"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "flowbite-react";

const getRoleTimeouts = (roleId: number) => {
  // roleId: 1 = Admin, 2 = Professor, 3 = Student
  if (roleId === 1) {
    return { warn: 14 * 60 * 1000, logout: 15 * 60 * 1000 };
  } else if (roleId === 2 || roleId === 3) {
    return { warn: 8 * 60 * 1000, logout: 10 * 60 * 1000 };
  }
  // Default: no timeout
  return { warn: null, logout: null };
};

const GRACE_SECONDS = 60;

const SessionTimeoutHandler = () => {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(GRACE_SECONDS);
  const warnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const showPopupRef = useRef(false);
  const [roleId, setRoleId] = useState<number | null>(null);

  // helpers
  const clearAllTimers = () => {
    if (warnTimeoutRef.current) clearTimeout(warnTimeoutRef.current);
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    warnTimeoutRef.current = null;
    logoutTimeoutRef.current = null;
    countdownIntervalRef.current = null;
  };

  // Get roleId from localStorage
  useEffect(() => {
    const getRole = () => {
      try {
        const raw = localStorage.getItem("user_details");
        if (raw) {
          const user = JSON.parse(raw);
          setRoleId(user.role_id);
        } else {
          setRoleId(null);
        }
      } catch {
        setRoleId(null);
      }
    };
    getRole();
    window.addEventListener("user_details_changed", getRole);
    return () => window.removeEventListener("user_details_changed", getRole);
  }, []);

  // Reset timers on activity
  const resetTimers = () => {
    if (!roleId) return;
    const { warn, logout } = getRoleTimeouts(roleId);
    if (!warn || !logout) return;

    clearAllTimers();
    setShowPopup(false);
    setSecondsLeft(GRACE_SECONDS);

    // schedule warning popup
    warnTimeoutRef.current = setTimeout(() => {
      // Show modal + toast
      setShowPopup(true);
      setSecondsLeft(GRACE_SECONDS);
      toast({
        title: "Session expiring soon",
        description: "You’ll be logged out in 60 seconds unless you extend.",
      });

      // start visual countdown
      countdownIntervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          const next = prev - 1;
          return next >= 0 ? next : 0;
        });
      }, 1000);

      // force logout after 60 seconds of grace
      logoutTimeoutRef.current = setTimeout(() => {
        handleLogout();
      }, GRACE_SECONDS * 1000);
    }, warn);
  };

  // Extend session
  const handleExtend = () => {
    clearAllTimers();
    setShowPopup(false);
    setSecondsLeft(GRACE_SECONDS);
    toast({ title: "Session Extended" });
    resetTimers();
  };

  // Logout
  const handleLogout = () => {
    clearAllTimers();
    setShowPopup(false);
    setSecondsLeft(GRACE_SECONDS);
    localStorage.clear();
    window.dispatchEvent(new Event("user_details_changed"));
    toast({ title: "Logged out due to inactivity" });
    router.push("/auth/auth1/login");
  };

  useEffect(() => {
  showPopupRef.current = showPopup;
}, [showPopup]);

useEffect(() => {
  if (!roleId) return;

  const events = ["mousemove", "keydown", "mousedown", "touchstart"];
  const activity = () => {
    // if modal is visible, do NOT auto-extend on passive activity
    if (showPopupRef.current) return;
    resetTimers();
  };

  events.forEach(e => window.addEventListener(e, activity));
  resetTimers();

  return () => {
    events.forEach(e => window.removeEventListener(e, activity));
    clearAllTimers();
  };
  // roleId only; showPopup is read via ref to avoid re-binding
  // eslint-disable-next-line
}, [roleId]);




  // Warning modal (no extra deps, just Tailwind)
  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 dark:bg-gray-900 dark:text-white">
            <div className="mb-2 text-xl font-semibold">Session expiring</div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              You’ll be logged out in{" "}
              <span className="font-semibold">{secondsLeft}</span> seconds due to inactivity.
            </p>

            <div className="mb-5 h-2 w-full overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((GRACE_SECONDS - secondsLeft) / GRACE_SECONDS) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                onClick={handleLogout}
                color={"light"}
              >
                Logout now
              </Button>
              <Button
                onClick={handleExtend}
                color={'primary'}
              >
                Stay signed in
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionTimeoutHandler;
