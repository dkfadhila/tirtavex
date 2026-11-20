"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { blankFor, isHiddenItem, labelOf, readPath, thumbUrl, writePath } from "./config";
import type { Field, Row } from "./config";
import { Button, EmptyState, ImageField, TagInput, useAdmin } from "./primitives";

function LinesField({ id, value, onChange }: { id: string; value: string[]; onChange: (next: string[]) => void }) {
  const [text, setText] = useState(value.join("\n"));
  return (
    <textarea
      id={id}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        onChange(event.target.value.split("\n").map((line) => line.trim()).filter(Boolean));
      }}
    />
  );
}

function FieldInput({ field, value, onChange, disabled }: { field: Field; value: unknown; onChange: (next: unknown) => void; disabled: boolean }) {
  const id = useId();
  const wide = field.wide || field.type === "textarea" || field.type === "lines" || field.type === "image" || field.type === "comma";
  const className = `ad-field ${wide ? "span-2" : ""}`;

  if (field.type === "checkbox") {
    return (
      <div className={className}>
        <label className="ad-check">
          <input type="checkbox" checked={Boolean(value)} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
          <span>{field.label}</span>
        </label>
        {field.help ? <p className="ad-hint">{field.help}</p> : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <label htmlFor={id}>{field.label}</label>
      {field.type === "select" ? (
        <select id={id} value={String(value ?? "")} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
          {field.options?.map((option) => (
            <option key={option || "empty"} value={option}>
              {field.optionLabels?.[option] || option || "Kosong"}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea id={id} value={String(value ?? "")} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
      ) : field.type === "lines" ? (
        <LinesField id={id} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />
      ) : field.type === "comma" ? (
        <TagInput value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} placeholder="Ketik lalu Enter atau koma" />
      ) : field.type === "image" ? (
        <ImageField value={typeof value === "string" ? value : ""} onChange={onChange} disabled={disabled} />
      ) : (
        <input
          id={id}
          type={field.type === "number" ? "number" : "text"}
          inputMode={field.type === "number" ? "decimal" : undefined}
          value={value == null ? "" : String(value)}
          disabled={disabled}
          onChange={(event) => onChange(field.type === "number" ? Number(event.target.value) : event.target.value)}
        />
      )}
      {field.help ? <p className="ad-hint">{field.help}</p> : null}
    </div>
  );
}

/** Slide-over editor: desktop right drawer, mobile full screen. Reused for every collection. */
export function EditorDrawer({
  fields,
  initial,
  disabled,
  onSave,
  onClose,
}: {
  fields: Field[];
  initial: Row;
  disabled: boolean;
  onSave: (value: Row) => Promise<boolean>;
  onClose: () => void;
}) {
  const { ask, error, clearError } = useAdmin();
  const [value, setValue] = useState<Row>(initial);
  const [saving, setSaving] = useState(false);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const panel = useRef<HTMLDivElement>(null);
  const dirty = JSON.stringify(value) !== baseline;
  const dirtyRef = useRef(dirty);
  const titleId = useId();

  const groups = useMemo(() => {
    const map = new Map<string, Field[]>();
    for (const field of fields) {
      const key = field.group || "Detail";
      map.set(key, [...(map.get(key) || []), field]);
    }
    return [...map.entries()];
  }, [fields]);

  async function requestClose() {
    if (dirtyRef.current) {
      const discard = await ask({
        title: "Tutup tanpa menyimpan?",
        body: "Perubahan yang belum disimpan akan hilang.",
        confirmLabel: "Buang perubahan",
        cancelLabel: "Lanjut mengedit",
        danger: true,
      });
      if (!discard) return;
    }
    onClose();
  }
  const closeRef = useRef(requestClose);
  useEffect(() => {
    dirtyRef.current = dirty;
    closeRef.current = requestClose;
  });

  useEffect(() => {
    clearError();
    const previous = document.activeElement as HTMLElement | null;
    const first = panel.current?.querySelector<HTMLElement>("input:not([type=file]), textarea, select");
    first?.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) void closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.({ preventScroll: true });
    };
  }, [clearError]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const thumb = thumbUrl(value);
  const isNew = !value.id;

  return (
    <div className="ad-drawer-wrap">
      <div className="ad-drawer-backdrop" onClick={() => void requestClose()} aria-hidden="true" />
      <div ref={panel} className="ad-drawer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <form
          className="ad-drawer-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            const ok = await onSave(value);
            setSaving(false);
            if (ok) {
              setBaseline(JSON.stringify(value));
              onClose();
            }
          }}
        >
          <header className="ad-drawer-head">
            <div className="min-w-0">
              <p className="ad-eyebrow">{isNew ? "Entri baru" : "Edit"}</p>
              <h2 id={titleId} className="ad-drawer-title">{isNew ? "Tambah baru" : labelOf(value)}</h2>
            </div>
            <button type="button" className="ad-icon-btn" aria-label="Tutup" onClick={() => void requestClose()}>×</button>
          </header>
          <div className="ad-drawer-body">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="ad-drawer-thumb" src={thumb} alt="" />
            ) : null}
            {groups.map(([group, groupFields]) => (
              <fieldset key={group} className="ad-group">
                <legend>{group}</legend>
                <div className="ad-grid-2">
                  {groupFields.map((field) => (
                    <FieldInput
                      key={field.key}
                      field={field}
                      value={readPath(value, field.key)}
                      disabled={disabled || saving}
                      onChange={(next) => setValue((current) => writePath(current, field.key, next))}
                    />
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          <footer className="ad-drawer-foot">
            {error ? <p className="ad-alert error" role="alert">{error}</p> : null}
            <div className="ad-row">
              <Button type="submit" variant="primary" loading={saving} disabled={disabled || !dirty}>
                {saving ? "Menyimpan…" : "Simpan"}
              </Button>
              <Button disabled={saving} onClick={() => void requestClose()}>Batal</Button>
              {dirty ? <span className="ad-dirty">Belum disimpan</span> : null}
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}

export function Collection({
  type,
  title,
  items,
  fields,
  disabled,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
}: {
  type: string;
  title: string;
  items: Row[];
  fields: Field[];
  disabled: boolean;
  onCreate: (data: Row) => Promise<boolean>;
  onUpdate: (id: string, data: Row) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onReorder: (ids: string[]) => Promise<boolean>;
}) {
  const { ask } = useAdmin();
  const [draft, setDraft] = useState<Row | null>(null);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState("");
  const filtered = items.filter((item) => !query.trim() || labelOf(item).toLowerCase().includes(query.trim().toLowerCase()));

  function move(index: number, direction: -1 | 1) {
    const ids = items.map((item) => String(item.id));
    const next = index + direction;
    if (next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    void onReorder(ids);
  }

  async function run(id: string, task: () => Promise<boolean>) {
    setPending(id);
    await task();
    setPending("");
  }

  return (
    <section className="ad-page">
      <header className="ad-page-head">
        <div>
          <h1>{title}</h1>
          <p className="muted">{items.length} entri. Urutan di sini sama dengan urutan di situs.</p>
        </div>
        <Button variant="primary" disabled={disabled} onClick={() => setDraft(structuredClone(blankFor(type, fields)))}>
          Tambah baru
        </Button>
      </header>
      <div className="ad-toolbar">
        <input
          type="search"
          aria-label={`Cari di ${title}`}
          placeholder="Cari…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <p className="muted">{filtered.length} dari {items.length}</p>
      </div>

      {draft ? (
        <EditorDrawer
          key={String(draft.id || "new")}
          fields={fields}
          initial={draft}
          disabled={disabled}
          onClose={() => setDraft(null)}
          onSave={(value) => (value.id ? onUpdate(String(value.id), value) : onCreate(value))}
        />
      ) : null}

      <ul className="ad-list">
        {filtered.map((item) => {
          const index = items.indexOf(item);
          const id = String(item.id);
          const thumb = thumbUrl(item);
          const hidden = isHiddenItem(item);
          const busy = pending === id;
          return (
            <li key={id} className="ad-row-card">
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt="" loading="lazy" className="ad-row-thumb" />
              ) : null}
              <div className="ad-row-main">
                <p className="ad-row-title">{labelOf(item)}</p>
                <div className="ad-badges">
                  {item.pinned ? <span className="ad-badge accent">Dipin</span> : null}
                  {hidden ? <span className="ad-badge">Disembunyikan</span> : null}
                </div>
              </div>
              <div className="ad-actions">
                <Button small aria-label="Naikkan" disabled={disabled || index === 0} onClick={() => move(index, -1)}>↑</Button>
                <Button small aria-label="Turunkan" disabled={disabled || index === items.length - 1} onClick={() => move(index, 1)}>↓</Button>
                {"pinned" in item ? (
                  <Button small disabled={disabled || busy} onClick={() => void run(id, () => onUpdate(id, { ...item, pinned: !item.pinned }))}>
                    {item.pinned ? "Lepas pin" : "Pin"}
                  </Button>
                ) : null}
                {"hidden" in item ? (
                  <Button small disabled={disabled || busy} onClick={() => void run(id, () => onUpdate(id, { ...item, hidden: !item.hidden }))}>
                    {item.hidden ? "Tampilkan" : "Sembunyikan"}
                  </Button>
                ) : null}
                {"status" in item && (item.status === "live" || item.status === "hidden") ? (
                  <Button small disabled={disabled || busy} onClick={() => void run(id, () => onUpdate(id, { ...item, status: item.status === "live" ? "hidden" : "live" }))}>
                    {item.status === "live" ? "Sembunyikan" : "Tampilkan"}
                  </Button>
                ) : null}
                <Button small variant="primary" disabled={disabled} onClick={() => setDraft(structuredClone(item))}>Edit</Button>
                <Button
                  small
                  variant="danger"
                  disabled={disabled || busy}
                  onClick={async () => {
                    const ok = await ask({
                      title: `Hapus “${labelOf(item)}”?`,
                      body: "Item ini hilang dari situs dan tidak bisa dikembalikan.",
                      confirmLabel: "Hapus",
                      danger: true,
                    });
                    if (ok) void run(id, () => onDelete(id));
                  }}
                >
                  Hapus
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      {filtered.length === 0 ? (
        <EmptyState
          title={query.trim() ? "Tidak ada yang cocok" : "Belum ada isinya"}
          hint={query.trim() ? "Coba kata kunci lain." : "Klik “Tambah baru” untuk membuat yang pertama."}
        />
      ) : null}
    </section>
  );
}
