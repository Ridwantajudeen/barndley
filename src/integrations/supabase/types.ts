export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          email: string | null;
          id: string;
          location: string | null;
          phone: string | null;
          shop_hours: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          location?: string | null;
          phone?: string | null;
          shop_hours?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          location?: string | null;
          phone?: string | null;
          shop_hours?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      shops: {
        Row: {
          area: string;
          cover_image_url: string | null;
          created_at: string;
          email: string | null;
          emoji: string;
          hue: string | null;
          hours: string | null;
          id: string;
          is_open: boolean;
          location: string;
          name: string;
          owner_user_id: string;
          phone: string | null;
          rating: number;
          reviews_count: number;
          tagline: string;
          updated_at: string;
        };
        Insert: {
          area: string;
          cover_image_url?: string | null;
          created_at?: string;
          email?: string | null;
          emoji?: string;
          hue?: string | null;
          hours?: string | null;
          id?: string;
          is_open?: boolean;
          location: string;
          name: string;
          owner_user_id: string;
          phone?: string | null;
          rating?: number;
          reviews_count?: number;
          tagline?: string;
          updated_at?: string;
        };
        Update: {
          area?: string;
          cover_image_url?: string | null;
          created_at?: string;
          email?: string | null;
          emoji?: string;
          hue?: string | null;
          hours?: string | null;
          id?: string;
          is_open?: boolean;
          location?: string;
          name?: string;
          owner_user_id?: string;
          phone?: string | null;
          rating?: number;
          reviews_count?: number;
          tagline?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shop_products: {
        Row: {
          available: boolean;
          category: string;
          created_at: string;
          description: string;
          emoji: string;
          id: string;
          name: string;
          photos: string[];
          shop_id: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          available?: boolean;
          category: string;
          created_at?: string;
          description?: string;
          emoji?: string;
          id?: string;
          name: string;
          photos?: string[];
          shop_id: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          available?: boolean;
          category?: string;
          created_at?: string;
          description?: string;
          emoji?: string;
          id?: string;
          name?: string;
          photos?: string[];
          shop_id?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_measurements: {
        Row: {
          created_at: string;
          id: string;
          label: string;
          price: number;
          product_id: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          label: string;
          price: number;
          product_id: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          label?: string;
          price?: number;
          product_id?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      shop_favorites: {
        Row: {
          created_at: string;
          id: string;
          shop_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          shop_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          shop_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          bundle: boolean;
          delivery_address: string;
          delivery_fee: number;
          hall: string;
          id: string;
          items_count: number;
          line_items: Json;
          note: string | null;
          order_code: string;
          payment_method: string;
          placed_at: string;
          rider_name: string | null;
          rider_phone: string | null;
          rider_user_id: string | null;
          room: string;
          service_fee: number;
          shop_id: string | null;
          shop_name: string;
          shop_names: string[];
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          bundle?: boolean;
          delivery_address: string;
          delivery_fee?: number;
          hall: string;
          id?: string;
          items_count?: number;
          line_items?: Json;
          note?: string | null;
          order_code: string;
          payment_method: string;
          placed_at?: string;
          rider_name?: string | null;
          rider_phone?: string | null;
          rider_user_id?: string | null;
          room: string;
          service_fee?: number;
          shop_id?: string | null;
          shop_name: string;
          shop_names?: string[];
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          bundle?: boolean;
          delivery_address?: string;
          delivery_fee?: number;
          hall?: string;
          id?: string;
          items_count?: number;
          line_items?: Json;
          note?: string | null;
          order_code?: string;
          payment_method?: string;
          placed_at?: string;
          rider_name?: string | null;
          rider_phone?: string | null;
          rider_user_id?: string | null;
          room?: string;
          service_fee?: number;
          shop_id?: string | null;
          shop_name?: string;
          shop_names?: string[];
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_user_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] };
        Returns: undefined;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "student" | "vendor" | "rider";
      order_status:
        | "Placed"
        | "Vendor confirmed"
        | "Rider en route to shop"
        | "Picked up"
        | "Student contacted"
        | "Picking items"
        | "Delivering"
        | "Delivered";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "vendor", "rider"],
      order_status: [
        "Placed",
        "Vendor confirmed",
        "Rider en route to shop",
        "Picked up",
        "Student contacted",
        "Picking items",
        "Delivering",
        "Delivered",
      ],
    },
  },
} as const;
