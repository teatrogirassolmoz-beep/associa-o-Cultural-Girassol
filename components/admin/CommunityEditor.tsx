"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  announcements,
  memberProfiles,
  safePublicHref,
  type MemberProfile,
  type Announcement,
} from "@/lib/community";
type Entry = Partial<MemberProfile & Announcement>;
export function CommunityEditor({
  kind,
  value,
  onSave,
}: {
  kind: "members" | "announcements";
  value?: string;
  onSave: (value: string) => Promise<void>;
}) {
  const [rows, setRows] = useState<Entry[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setRows(kind === "members" ? memberProfiles(value) : announcements(value));
  }, [value, kind]);
  function update(index: number, key: keyof Entry, v: string) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [key]: v } : row)),
    );
    setMessage("");
  }
  async function save() {
    if (
      rows.some((row) =>
        kind === "members"
          ? !row.name?.trim() ||
            !row.role?.trim() ||
            Boolean(row.photo && !safePublicHref(row.photo))
          : !row.label?.trim() || !safePublicHref(row.href),
      )
    ) {
      setMessage(
        kind === "members"
          ? "Preencha o nome e a função. Use um endereço válido para a fotografia."
          : "Preencha o texto e um endereço válido em todos os avisos.",
      );
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await onSave(JSON.stringify(rows));
      setMessage(
        "Alterações guardadas. Actualize a página pública para confirmar.",
      );
    } catch {
      setMessage(
        "Não foi possível guardar. Confirme a ligação e as permissões do seu perfil.",
      );
    } finally {
      setSaving(false);
    }
  }
  const fieldClass =
    "mt-2 w-full rounded-xl border border-white/20 bg-black/30 p-3 text-white";
  return (
    <div className="mt-6 space-y-5">
      <p className="max-w-3xl text-zinc-300">
        {kind === "members"
          ? "Apresente as pessoas da Associação e da equipa FITI. Adicione apenas perfis autorizados, com nome, função, fotografia e biografia."
          : "Estes avisos aparecem na faixa inferior do site. Use textos curtos com links para candidaturas, programação ou notícias. Não anuncie prazos ou vagas sem confirmação."}
      </p>
      {rows.map((row, i) => (
        <fieldset
          key={i}
          disabled={saving}
          className="grid gap-4 rounded-2xl border border-white/15 p-5 md:grid-cols-2"
        >
          <legend className="px-2 font-bold">
            {kind === "members"
              ? row.name || `Novo perfil ${i + 1}`
              : `Aviso ${i + 1}`}
          </legend>
          {kind === "members" ? (
            <>
              <label>
                Nome
                <input
                  className={fieldClass}
                  value={row.name || ""}
                  onChange={(e) => update(i, "name", e.target.value)}
                />
              </label>
              <label>
                Função
                <input
                  className={fieldClass}
                  value={row.role || ""}
                  onChange={(e) => update(i, "role", e.target.value)}
                />
              </label>
              <label>
                Área
                <select
                  aria-label="Área"
                  className={fieldClass}
                  value={row.group || "associacao"}
                  onChange={(e) => update(i, "group", e.target.value)}
                >
                  <option value="associacao">Associação</option>
                  <option value="fiti">FITI</option>
                </select>
              </label>
              <label>
                URL da fotografia
                <input
                  type="url"
                  className={fieldClass}
                  value={row.photo || ""}
                  onChange={(e) => update(i, "photo", e.target.value)}
                  placeholder="https://…"
                />
              </label>
              <label className="md:col-span-2">
                Biografia
                <textarea
                  rows={4}
                  className={fieldClass}
                  value={row.bio || ""}
                  onChange={(e) => update(i, "bio", e.target.value)}
                />
              </label>
            </>
          ) : (
            <>
              <label>
                Texto do aviso
                <input
                  className={fieldClass}
                  value={row.label || ""}
                  onChange={(e) => update(i, "label", e.target.value)}
                />
              </label>
              <label>
                Link de destino
                <input
                  className={fieldClass}
                  value={row.href || ""}
                  onChange={(e) => update(i, "href", e.target.value)}
                  placeholder="/fiti#formularios"
                />
              </label>
            </>
          )}
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-red-200"
            onClick={() => {
              setRows((current) => current.filter((_, n) => n !== i));
              setMessage("");
            }}
          >
            <Trash2 size={16} />
            Remover {kind === "members" ? "perfil" : "aviso"}
          </button>
        </fieldset>
      ))}
      {!rows.length && (
        <p className="text-zinc-400">
          {kind === "members"
            ? "Ainda não há perfis publicados."
            : "Sem avisos. A faixa ficará oculta."}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          className="flex items-center gap-2 rounded-full border border-white/30 px-5 py-3"
          onClick={() =>
            setRows((current) => [
              ...current,
              kind === "members"
                ? {
                    name: "",
                    role: "",
                    group: "associacao",
                    photo: "",
                    bio: "",
                  }
                : { label: "", href: "" },
            ])
          }
        >
          <Plus size={18} />
          Adicionar {kind === "members" ? "perfil" : "aviso"}
        </button>
        <button
          type="button"
          disabled={saving}
          className="rounded-full bg-sun px-5 py-3 font-bold text-black"
          onClick={save}
        >
          {saving ? "A guardar…" : "Guardar alterações"}
        </button>
      </div>
      <p role="status" className="text-sm text-sun">
        {message}
      </p>
    </div>
  );
}
