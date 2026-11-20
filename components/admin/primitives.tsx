"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { twimg } from "@/lib/twimg";

export type AskOptions = {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

export type AdminContextValue = {
  notify: (message: string, kind?: "ok" | "error") => void;
  ask: (options: AskOptions) => Promise<boolean>;
  error: string;
  clearError: () => void;
};

export const AdminContext = createContext<AdminContextValue>({
  notify: () => {},
  ask: async () => false,
  error: "",
  clearError: () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}

export function Spinner({ label }: { label?: string }) {
  return <span className="ad-spinner" role={label ? "status" : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
}

export function Button({
  variant = "default",
  loading = false,
  small = false,
  children,
  className = "",
  ...rest
}: {
  variant?: "default" | "primary" | "danger" | "ghost";
  loading?: boolean;
  small?: boolean;
  children: ReactNode;
  className?: string;
} & ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || loading}
      aria-busy={loading || undefined}
      className={`ad-btn ${variant} ${small ? "sm" : ""} ${className}`}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="ad-toggle-row">
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className="ad-switch"
        onClick={() => onChange(!checked)}
      >
        <span className="ad-switch-dot" />
      </button>
      <label htmlFor={id} className="ad-toggle-label">
        <span>{label}</span>
        {hint ? <small>{hint}</small> : null}
      </label>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <div className="ad-seg" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={value === option.value ? "on" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (next: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState("");
  const id = useId();

  function commit(raw: string) {
    const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
    if (!parts.length) return;
    const next = [...value];
    for (const part of parts) if (!next.some((tag) => tag.toLowerCase() === part.toLowerCase())) next.push(part);
    onChange(next.slice(0, 12));
    setText("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(text);
    } else if (event.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="ad-tags">
      {value.map((tag) => (
        <span key={tag} className="ad-tag">
          {tag}
          <button type="button" aria-label={`Hapus tag ${tag}`} onClick={() => onChange(value.filter((item) => item !== tag))}>
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        value={text}
        placeholder={value.length ? "" : placeholder}
        aria-label="Tambah tag"
        onChange={(event) => {
          const next = event.target.value;
          if (next.includes(",")) commit(next);
          else setText(next);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => commit(text)}
      />
    </div>
  );
}

export function previewSrc(src: string) {
  return src ? twimg(src, "small") : src;
}

/** Upload, drag-drop, or paste-URL image field with thumbnail preview. */
export function ImageField({
  value,
  onChange,
  disabled,
  compact: compactMode = false,
}: {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNote("File harus berupa gambar (PNG, JPG, WebP).");
      return;
    }
    setBusy(true);
    setNote("");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const json = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !json.url) setNote(json.error || "Upload gagal. Coba tempel link gambar.");
      else {
        onChange(json.url);
        setNote("Berhasil diupload.");
      }
    } catch {
      setNote("Upload gagal. Cek koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className={`ad-image ${compactMode ? "compact" : ""}`}>
      {value ? (
        <div className="ad-image-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewSrc(value)} alt="Pratinjau gambar" loading="lazy" />
          <Button small variant="danger" disabled={disabled} onClick={() => { onChange(""); setNote(""); }}>
            Hapus
          </Button>
        </div>
      ) : null}
      <label
        htmlFor={id}
        className={`ad-drop ${drag ? "drag" : ""}`}
        onDragOver={(event) => { event.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDrag(false);
          if (!disabled) void upload(event.dataTransfer.files?.[0]);
        }}
      >
        {busy ? <Spinner label="Mengupload" /> : null}
        <span>{busy ? "Mengupload…" : "Tarik gambar ke sini, atau klik untuk pilih file"}</span>
        <small>PNG, JPG, WebP · maks 4,5 MB · otomatis jadi WebP</small>
        <input
          ref={input}
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          disabled={disabled || busy}
          onChange={(event) => void upload(event.target.files?.[0])}
        />
      </label>
      <input
        value={value}
        placeholder="atau tempel link gambar (https://…)"
        aria-label="Link gambar"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      {note ? <p className="ad-note" role="status">{note}</p> : null}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="ad-empty">
      <p className="ad-empty-title">{title}</p>
      {hint ? <p className="muted">{hint}</p> : null}
      {action}
    </div>
  );
}

export function ConfirmDialog({ options, onResult }: { options: AskOptions; onResult: (ok: boolean) => void }) {
  const cancel = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useEffect(() => {
    cancel.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onResult(false);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onResult]);
  return (
    <div className="ad-modal-wrap" onMouseDown={(event) => { if (event.target === event.currentTarget) onResult(false); }}>
      <div className="ad-modal" role="alertdialog" aria-modal="true" aria-labelledby={titleId}>
        <p id={titleId} className="ad-modal-title">{options.title}</p>
        {options.body ? <p className="muted">{options.body}</p> : null}
        <div className="ad-modal-actions">
          <Button ref={cancel} onClick={() => onResult(false)}>{options.cancelLabel || "Batal"}</Button>
          <Button variant={options.danger ? "danger" : "primary"} onClick={() => onResult(true)}>{options.confirmLabel || "Ya"}</Button>
        </div>
      </div>
    </div>
  );
}

/** Small hook so pages can ask for confirmation without owning dialog state. */
export function useConfirmState() {
  const [state, setState] = useState<{ options: AskOptions; resolve: (ok: boolean) => void } | null>(null);
  const ask = useCallback(
    (options: AskOptions) => new Promise<boolean>((resolve) => setState({ options, resolve })),
    [],
  );
  const dialog = state ? (
    <ConfirmDialog
      options={state.options}
      onResult={(ok) => {
        state.resolve(ok);
        setState(null);
      }}
    />
  ) : null;
  return { ask, dialog };
}
