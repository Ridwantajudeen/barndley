import { useEffect, useState } from "react";
import { backendRequest } from "@/lib/backend";

export type VendorProfileRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  shop_hours: string | null;
  created_at: string;
  updated_at: string;
};

export type VendorProfileEdit = {
  name: string;
  location: string;
  hours: string;
  phone: string;
  email: string;
};

const makeEmptyProfile = (userId: string, email: string | null): VendorProfileRow => ({
  id: "",
  user_id: userId,
  display_name: null,
  email,
  phone: null,
  location: null,
  avatar_url: null,
  shop_hours: null,
  created_at: "",
  updated_at: "",
});

export function vendorProfileToEdit(profile: VendorProfileRow | null): VendorProfileEdit {
  return {
    name: profile?.display_name?.trim() || "",
    location: profile?.location?.trim() || "",
    hours: profile?.shop_hours?.trim() || "",
    phone: profile?.phone?.trim() || "",
    email: profile?.email?.trim() || "",
  };
}

export function useVendorProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<VendorProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const payload = await backendRequest<{ profile: VendorProfileRow | null }>("/vendor/profile");
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

  async function saveProfile(next: VendorProfileEdit) {
    const payload = await backendRequest<{ profile: VendorProfileRow | null }>("/vendor/profile", {
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

