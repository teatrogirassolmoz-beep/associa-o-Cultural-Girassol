"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import { normaliseSchedule, type CalendarEvent } from "@/lib/fitiCalendar";
type Edition = { id: string; year?: number; theme?: string };
type Schedule = {
  events: CalendarEvent[];
  edition: Edition | null;
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
};
const Context = createContext<Schedule | null>(null);
export function FitiScheduleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<{
    edition: Edition | null;
    events: CalendarEvent[];
  }>({ edition: null, events: [] });
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(false);
  const generation = useRef(0),
    mounted = useRef(false);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const [editions, program, workshops] = await Promise.all([
        supabase
          .from("fiti_editions")
          .select("*")
          .eq("active", true)
          .order("year", { ascending: false })
          .limit(1),
        supabase
          .from("fiti_program")
          .select("*")
          .eq("is_active", true)
          .order("date")
          .order("time"),
        supabase
          .from("fiti_workshops")
          .select("*")
          .eq("is_active", true)
          .order("date"),
      ]);
      if (!mounted.current || current !== generation.current) return;
      if (editions.error || program.error || workshops.error) {
        setError(true);
        setData({ edition: null, events: [] });
        return;
      }
      const edition = (editions.data?.[0] as Edition | undefined) ?? null;
      setData({
        edition,
        events: normaliseSchedule(
          program.data ?? [],
          workshops.data ?? [],
          edition?.id,
        ),
      });
    } catch {
      if (mounted.current && current === generation.current) {
        setError(true);
        setData({ edition: null, events: [] });
      }
    } finally {
      if (mounted.current && current === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
      generation.current++;
    };
  }, [refresh]);
  const value = useMemo(
    () => ({ ...data, loading, error, refresh }),
    [data, loading, error, refresh],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useFitiSchedule() {
  const value = useContext(Context);
  if (!value) throw new Error("Calendário fora do contexto FITI.");
  return value;
}
