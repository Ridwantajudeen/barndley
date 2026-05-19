import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";

export type ProfileField = {
  key: string;
  label: string;
  type?: "text" | "email" | "tel";
  placeholder?: string;
};

export function useProfile<T extends Record<string, string>>(storageKey: string, defaults: T): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(defaults);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setValue({ ...defaults, ...JSON.parse(raw) });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  const update = (next: T) => {
    setValue(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  };
  return [value, update];
}

export function EditProfileButton<T extends Record<string, string>>({
  values,
  fields,
  onSave,
  title = "Edit profile",
}: {
  values: T;
  fields: ProfileField[];
  onSave: (next: T) => void;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<T>(values);
  useEffect(() => { if (open) setDraft(values); }, [open, values]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-secondary font-semibold">
          <Pencil className="size-3.5" /> Edit
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key} className="text-xs">{f.label}</Label>
              <Input
                id={f.key}
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                value={draft[f.key] ?? ""}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value } as T)}
                maxLength={120}
              />
            </div>
          ))}
        </div>
        <DialogFooter className="flex-row justify-end gap-2">
          <button onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm bg-secondary">Cancel</button>
          <button
            onClick={() => { onSave(draft); setOpen(false); }}
            className="px-3 py-2 rounded-lg text-sm bg-foreground text-background font-semibold"
          >Save</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
