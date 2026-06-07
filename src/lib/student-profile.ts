import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type StudentProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type StudentProfileEdit = {
  name: string;
  phone: string;
  address: string;
};

const makeEmptyProfile = (userId: string, email: string | null): StudentProfileRow => ({
  id: "",
  user_id: userId,
  display_name: null,
  email,
  phone: null,
  location: null,
  avatar_url: null,
  created_at: "",
  updated_at: "",
});

export function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function displayNameFromProfile(profile: StudentProfileRow | null) {
  return profile?.display_name?.trim() || profile?.email?.split("@")[0] || "there";
}

export function profileToEdit(profile: StudentProfileRow | null): StudentProfileEdit {
  return {
    name: profile?.display_name?.trim() || "",
    phone: profile?.phone?.trim() || "",
    address: profile?.location?.trim() || "",
  };
}

export function useStudentProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data: auth, error } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error || !auth.user) {
        setUserId(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const user = auth.user;
      setUserId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select("id, user_id, display_name, email, phone, location, avatar_url, created_at, updated_at")
        .eq("user_id", user.id)
        .maybeSingle<StudentProfileRow>();

      if (cancelled) return;

      setProfile(data ?? makeEmptyProfile(user.id, user.email ?? null));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { userId, profile, setProfile, loading };
}
