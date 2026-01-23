"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import type { PeriodEvent } from "@/lib/period";

export function usePeriods() {
  const [periods, setPeriods] = useState<PeriodEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setPeriods([]);
        setLoading(false);
        return;
      }

      // Subscribe to user's periods document
      const userDocRef = doc(db, "users", currentUser.uid);

      const unsubscribeDoc = onSnapshot(
        userDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setPeriods(data.periods || []);
          } else {
            setPeriods([]);
          }
          setLoading(false);
        },
        (err) => {
          console.error("取得經期資料失敗:", err);
          setError(err);
          setLoading(false);
        }
      );

      return () => unsubscribeDoc();
    });

    return () => unsubscribeAuth();
  }, []);

  const savePeriods = async (newPeriods: PeriodEvent[]) => {
    if (!user) {
      throw new Error("使用者未登入");
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { periods: newPeriods }, { merge: true });
    } catch (err) {
      console.error("儲存經期資料失敗:", err);
      throw err;
    }
  };

  return {
    periods,
    loading,
    error,
    savePeriods,
    isLoggedIn: !!user,
  };
}
