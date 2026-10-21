import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import {
  hasCompletedOnboarding,
  mapUser,
  readProgress,
  signInWithGoogle as startGoogleSignIn,
  signInWithPassword as startPasswordSignIn,
  signOut as startSignOut,
  signUpWithPassword as startPasswordSignUp,
  updateOnboardingProfile,
  writeProgress,
  type AppUser,
} from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

type AppContextValue = {
  authReady: boolean;
  hydrated: boolean;
  session: Session | null;
  user: AppUser | null;
  answers: Record<string, number>;
  result: any;
  savedCareerIds: string[];
  hasProfile: boolean;
  signInWithPassword: (email: string, password: string) => Promise<AppUser>;
  signUpWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ user: AppUser | null; needsEmailConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (profile: {
    fullName: string;
    academicLevel: string;
    fieldOfStudy: string;
  }) => Promise<void>;
  setAnswer: (questionId: string, value: number) => void;
  resetAssessment: () => void;
  setResult: (result: any) => void;
  toggleSavedCareer: (careerId: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResultState] = useState<any>(null);
  const [savedCareerIds, setSavedCareerIds] = useState<string[]>([]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    function applySession(nextSession: Session | null, loadProgress: boolean) {
      setSession(nextSession);
      const nextUser = nextSession?.user ? mapUser(nextSession.user) : null;
      setUser(nextUser);
      if (!loadProgress) return;
      if (nextUser) {
        const progress = readProgress(nextUser.id);
        setAnswers(progress.answers);
        setResultState(progress.result);
        setSavedCareerIds(progress.savedCareerIds);
      } else {
        setAnswers({});
        setResultState(null);
        setSavedCareerIds([]);
      }
    }

    void supabase.auth.getSession().then(({ data }) => {
      applySession(data.session, true);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // getSession already applied the first snapshot; skip so we don't reload progress twice.
      if (event === "INITIAL_SESSION") return;
      applySession(nextSession, event === "SIGNED_IN" || event === "SIGNED_OUT");
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;
    writeProgress(user.id, { answers, result, savedCareerIds });
  }, [authReady, user, answers, result, savedCareerIds]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    return startPasswordSignIn(email, password);
  }, []);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    return startPasswordSignUp(email, password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await startGoogleSignIn();
  }, []);

  const signOut = useCallback(async () => {
    await startSignOut();
  }, []);

  const completeOnboarding = useCallback(
    async (profile: { fullName: string; academicLevel: string; fieldOfStudy: string }) => {
      const nextUser = await updateOnboardingProfile(profile);
      setUser(nextUser);
    },
    [],
  );

  const setAnswer = useCallback((questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const resetAssessment = useCallback(() => {
    setAnswers({});
    setResultState(null);
  }, []);

  const setResult = useCallback((next: any) => {
    setResultState(next);
  }, []);

  const toggleSavedCareer = useCallback((careerId: string) => {
    setSavedCareerIds((prev) =>
      prev.includes(careerId) ? prev.filter((id) => id !== careerId) : [...prev, careerId],
    );
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      authReady,
      hydrated: authReady,
      session,
      user,
      answers,
      result,
      savedCareerIds,
      hasProfile: hasCompletedOnboarding(user),
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
      completeOnboarding,
      setAnswer,
      resetAssessment,
      setResult,
      toggleSavedCareer,
    }),
    [
      authReady,
      session,
      user,
      answers,
      result,
      savedCareerIds,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
      completeOnboarding,
      setAnswer,
      resetAssessment,
      setResult,
      toggleSavedCareer,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside <AppProvider>");
  return context;
}
