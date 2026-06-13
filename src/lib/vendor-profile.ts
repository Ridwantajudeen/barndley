import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type VendorProfileRow = Database["public"]["Tables"]["profiles"]["Row"] & {
  shop_hours: string | null;
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
        .select("id, user_id, display_name, email, phone, location, avatar_url, shop_hours, created_at, updated_at")
        .eq("user_id", user.id)
        .maybeSingle<VendorProfileRow>();

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
