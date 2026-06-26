import { useEffect, useState } from "react";
import { backendRequest } from "@/lib/backend";

export type StudentProfileRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

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
      const payload = await backendRequest<{ profile: StudentProfileRow | null }>("/student/profile");
      if (cancelled) return;
      if (!payload.profile) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setUserId(payload.profile.user_id);
      setProfile(payload.profile);
      setLoading(false);
    })().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfile(next: StudentProfileEdit) {
    const payload = await backendRequest<{ profile: StudentProfileRow | null }>("/student/profile", {
      method: "PUT",
      body: next,
    });
    if (!payload.profile) throw new Error("Could not save profile");
    setUserId(payload.profile.user_id);
    setProfile(payload.profile);
    return payload.profile;
  }

  return { userId, profile, setProfile, loading, saveProfile, makeEmptyProfile };
}

