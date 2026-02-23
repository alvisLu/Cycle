"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
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

      const userRef = doc(db, "users", currentUser.uid);
      const q = query(
        collection(db, "periods"),
        where("user", "==", userRef)
      );

      const unsubscribeDoc = onSnapshot(
        q,
        (snapshot) => {
          setPeriods(snapshot.docs.map((d) => d.data() as PeriodEvent));
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
      const userRef = doc(db, "users", user.uid);
      const periodsRef = collection(db, "periods");
      const q = query(periodsRef, where("user", "==", userRef));
      const snapshot = await getDocs(q);

      await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
      await Promise.all(
        newPeriods.map((period) =>
          addDoc(periodsRef, { ...period, user: userRef })
        )
      );
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
