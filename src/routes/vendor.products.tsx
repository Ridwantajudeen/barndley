import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { vendorNav } from "@/components/VendorNav";
import { shops, formatNaira } from "@/lib/mock";
import { catalog } from "@/lib/catalog";
import { SearchSelect } from "@/components/SearchSelect";
import { EmojiPicker } from "@/components/EmojiPicker";
import { useState, useMemo } from "react";
import { Plus, X, Trash2 } from "lucide-react";

export const Route = createFileRoute("/vendor/products")({
  head: () => ({ meta: [{ title: "Products — Vendor" }] }),
  component: VendorProducts,
});

function VendorProducts() {
  const initial = shops[0].products;
  const [products, setProducts] = useState(initial);
  const [editing, setEditing] = useState<null | typeof initial[number] | "new">(null);

  return (
    <MobileShell nav={vendorNav} title="Your products">
      <button
        onClick={() => setEditing("new")}
        className="w-full card-soft p-3 flex items-center gap-3 hover:shadow-md transition-shadow"
      >
        <span className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center"><Plus className="size-4"/></span>
        <span className="font-semibold text-sm">Add a new product</span>
      </button>

      <div className="space-y-3 mt-4">
        {products.map((p) => (
          <div key={p.id} className="card-soft p-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary-soft flex items-center justify-center text-2xl">{p.emoji}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-[0.7rem] text-foreground/60">{p.measurements.length} measurements</div>
              </div>
              <button onClick={() => setEditing(p)} className="text-xs font-semibold text-primary px-3 py-1.5 rounded-full bg-primary-soft">Edit</button>
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
          onSave={(p) => {
            setProducts((prev) => {
              const exists = prev.find((x) => x.id === p.id);
              return exists ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p];
            });
            setEditing(null);
          }}
        />
      )}
    </MobileShell>
  );
}

function ProductSheet({
  product, onClose, onSave
}: { product: any; onClose: () => void; onSave: (p: any) => void }) {
  const matchedCat = useMemo(
    () => catalog.find((c) => c.name === product?.category || c.id === product?.category),
    [product],
  );
  const matchedItem = matchedCat?.items.find((i) => i === product?.name);

  const [emoji, setEmoji] = useState(product?.emoji ?? "🥫");
  const [category, setCategory] = useState<string>(
    product ? (matchedCat ? matchedCat.name : "Other") : "",
  );
  const [customCategory, setCustomCategory] = useState(
    product && !matchedCat ? product.category ?? "" : "",
  );
  const [productName, setProductName] = useState<string>(
    product ? (matchedItem ? matchedItem : "Other") : "",
  );
  const [customProductName, setCustomProductName] = useState(
    product && !matchedItem ? product.name ?? "" : "",
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [measurements, setMeasurements] = useState<{id:string;label:string;price:number}[]>(
    product?.measurements ?? [{ id: "m1", label: "", price: 0 }],
  );

  const categoryOptions = ["Other", ...catalog.map((c) => c.name)];
  const activeCat = catalog.find((c) => c.name === category);
  const productOptions = activeCat ? ["Other", ...activeCat.items] : ["Other"];

  const finalCategory = category === "Other" ? customCategory.trim() : category;
  const finalName = productName === "Other" ? customProductName.trim() : productName;
  const canSave = !!finalCategory && !!finalName && measurements.some((m) => m.label && m.price > 0);

  function addRow() {
    setMeasurements((m) => [...m, { id: "m" + (m.length + 1), label: "", price: 0 }]);
  }
  function update(i: number, patch: Partial<{label:string;price:number}>) {
    setMeasurements((m) => m.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function remove(i: number) {
    setMeasurements((m) => m.filter((_, idx) => idx !== i));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"/>
      <div onClick={(e)=>e.stopPropagation()} className="relative bg-background w-full max-w-[480px] rounded-t-3xl p-5 pb-7 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-xl">{product ? "Edit product" : "New product"}</h3>
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center"><X className="size-4"/></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[0.7rem] font-semibold text-foreground/60 ml-1">CATEGORY</label>
            <div className="mt-1">
              <SearchSelect
                value={category}
                onChange={(v) => {
                  setCategory(v);
                  setProductName("");
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
            <div className="mt-1">
              <SearchSelect
                value={productName}
                onChange={(v) => {
                  setProductName(v);
                  if (v !== "Other") setCustomProductName("");
                }}
                options={productOptions}
                placeholder={category ? "Select a product" : "Pick category first"}
                disabled={!category}
              />
            </div>
            {productName === "Other" && (
              <input
                value={customProductName}
                onChange={(e) => setCustomProductName(e.target.value)}
                placeholder="Custom product name"
                className="mt-2 w-full px-4 h-11 rounded-xl bg-card border border-border text-sm animate-in fade-in-0 slide-in-from-top-1"
              />
            )}
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
          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Short description (optional)" rows={2} className="w-full p-3 rounded-xl bg-card border border-border text-sm"/>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-foreground/70">CUSTOM MEASUREMENTS</div>
            <button onClick={addRow} className="text-xs font-semibold text-primary inline-flex items-center gap-1"><Plus className="size-3.5"/> Add</button>
          </div>
          <p className="text-[0.7rem] text-foreground/50 mb-2">
            Any label works — "1 milk cup", "Half paint", "Big bowl". Set a price for each.
          </p>
          <div className="space-y-2">
            {measurements.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={m.label}
                  onChange={(e)=>update(i,{label:e.target.value})}
                  placeholder="e.g. 1 milk cup"
                  className="flex-1 px-3 h-11 rounded-xl bg-card border border-border text-sm"
                />
                <div className="flex items-center bg-card border border-border rounded-xl h-11 px-3 text-sm">
                  <span className="text-foreground/50">₦</span>
                  <input
                    type="number"
                    value={m.price || ""}
                    onChange={(e)=>update(i,{price:Number(e.target.value)})}
                    placeholder="0"
                    className="w-20 bg-transparent focus:outline-none text-right"
                  />
                </div>
                <button onClick={()=>remove(i)} className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center"><Trash2 className="size-4 text-destructive"/></button>
              </div>
            ))}
          </div>
        </div>

        <button
          disabled={!canSave}
          onClick={() => onSave({
            id: product?.id ?? "p" + Date.now(),
            name: finalName,
            customName: productName === "Other" ? customProductName.trim() : undefined,
            emoji,
            category: finalCategory,
            description,
            available: true,
            measurements: measurements.filter(m=>m.label && m.price>0),
          })}
          className="mt-6 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save product
        </button>
      </div>
    </div>
  );
}
