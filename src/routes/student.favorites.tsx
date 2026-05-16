import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { shops } from "@/lib/mock";
import { Heart, Star } from "lucide-react";

export const Route = createFileRoute("/student/favorites")({
  head: () => ({ meta: [{ title: "Saved shops — Campus Basket" }] }),
  component: () => (
    <MobileShell nav={studentNav} title="Saved shops">
      <div className="space-y-3 mt-3">
        {shops.slice(0, 2).map((s) => (
          <div key={s.id} className="card-soft p-3 flex items-center gap-3">
            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${s.hue} flex items-center justify-center text-2xl`}>
              {s.emoji}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
                <Star className="size-3 fill-accent text-accent"/> {s.rating} · {s.distanceKm} km
              </div>
            </div>
            <Heart className="size-5 fill-accent text-accent"/>
          </div>
        ))}
      </div>
    </MobileShell>
  ),
});
