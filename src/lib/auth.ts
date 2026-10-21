import type { Session, User } from "@supabase/supabase-js";
import { getAuthCallbackUrl, requireSupabase } from "@/lib/supabase";

export type AppUser = {
  id: string;
  email: string;
  fullName: string;
  academicLevel: string;
  fieldOfStudy: string;
  isAdult: boolean;
};

export type ProgressState = {
  answers: Record<string, number>;
  result: unknown;
  savedCareerIds: string[];
};

const LEGACY_STORAGE_KEY = "aim-navigator-state";

export function progressStorageKey(userId: string): string {
  return `aim-navigator-progress:${userId}`;
}

function readMetaString(meta: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = meta[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function mapUser(user: User): AppUser {
  const meta =
    user.user_metadata && typeof user.user_metadata === "object"
      ? (user.user_metadata as Record<string, unknown>)
      : {};

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: readMetaString(meta, ["full_name", "name"]),
    academicLevel: readMetaString(meta, ["academic_level"]),
    fieldOfStudy: readMetaString(meta, ["field_of_study"]),
    isAdult: meta["is_adult"] === true,
  };
}

export function hasCompletedOnboarding(user: AppUser | null): boolean {
  if (!user) return false;
  return (
    user.fullName.trim().length >= 2 &&
    user.academicLevel !== "" &&
    user.fieldOfStudy.trim().length >= 2 &&
    user.isAdult
  );
}

export function postAuthPath(user: AppUser | null): "/dashboard" | "/onboarding" {
  return hasCompletedOnboarding(user) ? "/dashboard" : "/onboarding";
}

const EMPTY_PROGRESS: ProgressState = {
  answers: {},
  result: null,
  savedCareerIds: [],
};

export function readProgress(userId: string): ProgressState {
  try {
    const namespaced = window.localStorage.getItem(progressStorageKey(userId));
    if (namespaced) {
      const parsed = JSON.parse(namespaced) as Partial<ProgressState>;
      return {
        answers: parsed.answers ?? {},
        result: parsed.result ?? null,
        savedCareerIds: parsed.savedCareerIds ?? [],
      };
    }

    // One-time move from the old single-user demo blob.
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as Partial<ProgressState>;
      const progress: ProgressState = {
        answers: parsed.answers ?? {},
        result: parsed.result ?? null,
        savedCareerIds: parsed.savedCareerIds ?? [],
      };
      window.localStorage.setItem(progressStorageKey(userId), JSON.stringify(progress));
      return progress;
    }
  } catch {
    // ignore corrupted storage
  }
  return { ...EMPTY_PROGRESS, answers: {} };
}

export function writeProgress(userId: string, progress: ProgressState): void {
  try {
    window.localStorage.setItem(progressStorageKey(userId), JSON.stringify(progress));
  } catch {
    // storage full or blocked; in-memory state still works
  }
}

export async function signInWithPassword(email: string, password: string): Promise<AppUser> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error("Sign-in did not return a user.");
  return mapUser(data.user);
}

export async function signUpWithPassword(email: string, password: string): Promise<{
  user: AppUser | null;
  needsEmailConfirmation: boolean;
}> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: getAuthCallbackUrl() },
  });
  if (error) throw error;
  return {
    user: data.user ? mapUser(data.user) : null,
    needsEmailConfirmation: Boolean(data.user) && !data.session,
  };
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthCallbackUrl(),
    },
  });
  if (error) throw error;
}

export async function completeOAuthCallback(): Promise<Session> {
  const supabase = requireSupabase();
  const url = new URL(window.location.href);
  const oauthError = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (oauthError) throw new Error(oauthError);

  const code = url.searchParams.get("code");
  const flowId = url.searchParams.get("sb_flow_id");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );
    if (error) {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw error;
      return data.session;
    }
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) {
    throw new Error("No session after sign-in. Please try again.");
  }
  return data.session;
}

export async function updateOnboardingProfile(profile: {
  fullName: string;
  academicLevel: string;
  fieldOfStudy: string;
}): Promise<AppUser> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.updateUser({
    data: {
      full_name: profile.fullName,
      academic_level: profile.academicLevel,
      field_of_study: profile.fieldOfStudy,
      is_adult: true,
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error("Could not save your profile.");
  return mapUser(data.user);
}

export async function signOut(): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function authErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
