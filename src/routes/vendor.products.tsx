import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, LoaderCircle, Plus, Trash2, X } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { vendorNav } from "@/components/VendorNav";
import { EmojiPicker } from "@/components/EmojiPicker";
import { SearchSelect } from "@/components/SearchSelect";
import { catalog } from "@/lib/catalog";
import { formatNaira } from "@/lib/mock";
import { useVendorShop, type VendorProduct } from "@/lib/vendor-shop";
import { toast } from "sonner";

export const Route = createFileRoute("/vendor/products")({
  head: () => ({ meta: [{ title: "Products - Vendor" }] }),
  component: VendorProducts,
});

function VendorProducts() {
  const { shop, loading, saveProduct, syncing } = useVendorShop();
  const products = shop?.products ?? [];
  const [editing, setEditing] = useState<null | VendorProduct | "new">(null);
  const [saving, setSaving] = useState(false);

  return (
    <MobileShell nav={vendorNav} title="Your products">
      {!shop?.id && !loading && (
        <div className="card-soft p-4 text-sm text-foreground/70">
          Create your shop profile first, then come back here to add products.
          <Link to="/vendor/profile" className="mt-3 block font-semibold text-primary">
            Go to shop profile
          </Link>
        </div>
      )}

      <button
        disabled={!shop?.id}
        onClick={() => setEditing("new")}
        className="w-full card-soft p-3 flex items-center gap-3 hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
          <Plus className="size-4" />
        </span>
        <span className="font-semibold text-sm">Add a new product</span>
      </button>

      {loading && !shop?.id && (
        <div className="card-soft p-4 mt-3 text-sm text-foreground/70 inline-flex items-center gap-2">
          <LoaderCircle className="size-4 animate-spin" />
          Loading your products...
        </div>
      )}
      {syncing && shop?.id && (
        <p className="mt-2 text-[0.7rem] text-foreground/50 inline-flex items-center gap-1.5">
          <LoaderCircle className="size-3.5 animate-spin" /> Syncing products...
        </p>
      )}

      <div className="space-y-3 mt-4">
        {products.map((p) => (
          <div key={p.id} className="card-soft p-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary-soft flex items-center justify-center text-2xl">
                {p.emoji}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-[0.7rem] text-foreground/60">{p.measurements.length} measurements</div>
              </div>
              <button
                onClick={() => setEditing(p)}
                className="text-xs font-semibold text-primary px-3 py-1.5 rounded-full bg-primary-soft"
              >
                Edit
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.measurements.map((m) => (
                <span key={m.id} className="text-[0.68rem] px-2 py-1 rounded-full bg-secondary">
                  {m.label} <span className="text-foreground/50">·</span> <b>{formatNaira(m.price)}</b>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ProductSheet
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (p) => {
            setSaving(true);
            try {
              await saveProduct(p);
              setEditing(null);
              toast.success("Product saved");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to save product");
            } finally {
              setSaving(false);
            }
          }}
          saving={saving}
        />
      )}
    </MobileShell>
  );
}

function ProductSheet({
  product,
  onClose,
  onSave,
  saving,
}: {
  product: VendorProduct | null;
  onClose: () => void;
  onSave: (p: VendorProduct) => void | Promise<void>;
  saving: boolean;
}) {
  const matchedCategory = product
    ? catalog.find((c) => c.name === product.category || c.id === product.category)
    : null;

  const [emoji, setEmoji] = useState(product?.emoji ?? "🥬");
  const [category, setCategory] = useState<string>(product ? matchedCategory?.name ?? "Other" : "");
  const [customCategory, setCustomCategory] = useState(
    product && !matchedCategory ? product.category ?? "" : "",
  );
  const [productName, setProductName] = useState<string>(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [measurements, setMeasurements] = useState<{ id: string; label: string; price: number }[]>(
    product?.measurements ?? [{ id: crypto.randomUUID(), label: "", price: 0 }],
  );
  const [photos, setPhotos] = useState<string[]>(product?.photos ?? []);

  function onFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files)
      .slice(0, 6 - photos.length)
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const url = String(reader.result || "");
          if (url) setPhotos((prev) => (prev.length >= 6 ? prev : [...prev, url]));
        };
        reader.readAsDataURL(file);
      });
  }

  const categoryOptions = ["Other", ...catalog.map((c) => c.name)];
  const finalCategory = category === "Other" ? customCategory.trim() : category;
  const finalName = productName.trim();
  const canSave = !!finalCategory && !!finalName && measurements.some((m) => m.label && m.price > 0);

  function addRow() {
    setMeasurements((m) => [...m, { id: crypto.randomUUID(), label: "", price: 0 }]);
  }

  function update(i: number, patch: Partial<{ label: string; price: number }>) {
    setMeasurements((m) => m.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function remove(i: number) {
    setMeasurements((m) => m.filter((_, idx) => idx !== i));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-background w-full max-w-[480px] rounded-t-3xl p-5 pb-7 max-h-[88vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-xl">{product ? "Edit product" : "New product"}</h3>
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[0.7rem] font-semibold text-foreground/60 ml-1">CATEGORY</label>
            <div className="mt-1">
              <SearchSelect
                value={category}
                onChange={(v) => {
                  setCategory(v);
                  if (v !== "Other") setCustomCategory("");
                }}
                options={categoryOptions}
                placeholder="Select a category"
              />
            </div>
            {category === "Other" && (
              <input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Custom category name"
                className="mt-2 w-full px-4 h-11 rounded-xl bg-card border border-border text-sm animate-in fade-in-0 slide-in-from-top-1"
              />
            )}
          </div>

          <div>
            <label className="text-[0.7rem] font-semibold text-foreground/60 ml-1">PRODUCT NAME</label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Type a product name"
              className="mt-1 w-full px-4 h-11 rounded-xl bg-card border border-border text-sm"
            />
          </div>

          <div>
            <label className="text-[0.7rem] font-semibold text-foreground/60 ml-1">ICON</label>
            <div className="mt-1 flex items-center gap-3">
              <EmojiPicker
                value={emoji}
                onChange={setEmoji}
                hint={`${finalName} ${finalCategory} ${description}`}
              />
              <span className="text-[0.7rem] text-foreground/50 leading-snug">
                Tap to pick from food emojis. We suggest matches based on the product name & category.
              </span>
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            rows={2}
            className="w-full p-3 rounded-xl bg-card border border-border text-sm"
          />

          <div>
            <label className="text-[0.7rem] font-semibold text-foreground/60 ml-1">PHOTOS</label>
            <p className="text-[0.7rem] text-foreground/50 mt-1 mb-2">
              Add up to 6 photos. Buyers will see these when choosing a measurement.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-card">
                  <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-foreground/70 text-background flex items-center justify-center"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              {photos.length < 6 && (
                <label className="aspect-square rounded-xl border border-dashed border-border bg-card flex flex-col items-center justify-center gap-1 cursor-pointer text-foreground/60 hover:bg-secondary">
                  <Camera className="size-5" />
                  <span className="text-[0.65rem] font-semibold">Add photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      onFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-foreground/70">CUSTOM MEASUREMENTS</div>
            <button onClick={addRow} className="text-xs font-semibold text-primary inline-flex items-center gap-1">
              <Plus className="size-3.5" /> Add
            </button>
          </div>
          <p className="text-[0.7rem] text-foreground/50 mb-2">
            Any label works - "1 milk cup", "Half paint", "Big bowl". Set a price for each.
          </p>
          <div className="space-y-2">
            {measurements.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={m.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  placeholder="e.g. 1 milk cup"
                  className="flex-1 px-3 h-11 rounded-xl bg-card border border-border text-sm"
                />
                <div className="flex items-center bg-card border border-border rounded-xl h-11 px-3 text-sm">
                  <span className="text-foreground/50">#</span>
                  <input
                    type="number"
                    value={m.price || ""}
                    onChange={(e) => update(i, { price: Number(e.target.value) })}
                    placeholder="0"
                    className="w-20 bg-transparent focus:outline-none text-right"
                  />
                </div>
                <button
                  onClick={() => remove(i)}
                  className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center"
                >
                  <Trash2 className="size-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          disabled={!canSave || saving}
          onClick={() =>
            onSave({
              id: product?.id ?? "",
              name: finalName,
              emoji,
              category: finalCategory,
              description,
              available: true,
              measurements: measurements.filter((m) => m.label && m.price > 0),
              photos,
            })
          }
          className="mt-6 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="inline-flex items-center gap-2">
            {saving && <LoaderCircle className="size-4 animate-spin" />}
            {saving ? "Saving..." : "Save product"}
          </span>
        </button>
      </div>
    </div>
  );
}
