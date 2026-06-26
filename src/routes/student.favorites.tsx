import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, LoaderCircle, Star } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { backendRequest } from "@/lib/backend";
import { useLiveShops, type LiveShop } from "@/lib/live-shops";

export const Route = createFileRoute("/student/favorites")({
  head: () => ({ meta: [{ title: "Saved shops - Campus Basket" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { shops } = useLiveShops();
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const payload = await backendRequest<{ favoriteIds: string[] }>("/student/favorites");
        if (cancelled) return;
        setFavoriteIds(payload.favoriteIds ?? []);
      } catch {
        if (!cancelled) setFavoriteIds([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const favorites = shops.filter((shop) => favoriteIds.includes(shop.id));

  return (
    <MobileShell nav={studentNav} title="Saved shops">
      {loading ? (
        <div className="card-soft p-4 inline-flex items-center gap-2 text-sm text-foreground/70">
          <LoaderCircle className="size-4 animate-spin" />
          Loading saved shops...
        </div>
      ) : favorites.length === 0 ? (
        <div className="card-soft p-6 text-sm text-foreground/60">
          No saved shops yet. Open a live shop and save it from the shop page.
        </div>
      ) : (
        <div className="space-y-3 mt-3">
          {favorites.map((shop) => (
            <ShopRow key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </MobileShell>
  );
}

function ShopRow({ shop }: { shop: LiveShop }) {
  return (
    <div className="card-soft p-3 flex items-center gap-3">
      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${shop.hue} flex items-center justify-center text-2xl overflow-hidden`}>
        {shop.cover_image_url ? <img src={shop.cover_image_url} alt={shop.name} className="h-full w-full object-cover" /> : shop.emoji}
      </div>
      <div className="flex-1">
        <div className="font-semibold">{shop.name}</div>
        <div className="text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
          <Star className="size-3 fill-accent text-accent" />
          {shop.rating.toFixed(1)} - {shop.location}
        </div>
      </div>
      <Heart className="size-5 fill-accent text-accent" />
    </div>
  );
}

