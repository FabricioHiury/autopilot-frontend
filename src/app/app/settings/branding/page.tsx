'use client';
import { useState, useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useAppAuth } from '@/contexts/auth-app-context';
import { DEFAULT_COLORS, applyTenantTheme, safeAssetUrl } from '@/lib/tenant-theme';
import { tenantService } from '@/services/tenant.service';
import type { UpdateTenantConfig } from '@/types/store';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
export default function BrandingPage() {
  const { tenant, loading, error, reload, setTenant } = useTenant();
  const auth = useAppAuth();
  const [uploading, setUploading] = useState(false);
  const [draft, setDraft] = useState<UpdateTenantConfig>({}),
    [saving, setSaving] = useState(false);
  const owner = auth.getUser()?.profile === 'storeOwner';
  useEffect(() => {
    if (tenant)
      setDraft({
        ...tenant,
        primaryColor: tenant.primaryColor || DEFAULT_COLORS.primaryColor,
        secondaryColor: tenant.secondaryColor || DEFAULT_COLORS.secondaryColor,
        accentColor: tenant.accentColor || DEFAULT_COLORS.accentColor,
      });
  }, [tenant]);
  useEffect(() => {
    if (owner) applyTenantTheme({ ...tenant, ...draft });
    return () => applyTenantTheme(tenant);
  }, [draft, tenant, owner]);
  async function upload(file: File | undefined) {
    if (!file) return;
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      toast.error('Use uma imagem PNG, JPEG ou WebP de até 5 MB.');
      return;
    }
    setUploading(true);
    try {
      const result = await tenantService.uploadLogo(file);
      setDraft((previous) => ({ ...previous, logoLightUrl: result.url }));
      toast.success('Logo enviada. Salve a identidade visual para aplicá-la ao tema.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploading(false);
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const {
        displayName,
        primaryColor,
        secondaryColor,
        accentColor,
        logoLightUrl,
        logoDarkUrl,
        faviconUrl,
        openingTime,
        closingTime,
        workingDays,
      } = draft;
      const payload = {
        displayName,
        primaryColor,
        secondaryColor,
        accentColor,
        ...(logoLightUrl ? { logoLightUrl } : {}),
        ...(logoDarkUrl ? { logoDarkUrl } : {}),
        ...(faviconUrl ? { faviconUrl } : {}),
        ...(openingTime ? { openingTime } : {}),
        ...(closingTime ? { closingTime } : {}),
        workingDays,
      };
      if (openingTime && closingTime && openingTime >= closingTime)
        throw new Error('O fechamento deve ser depois da abertura.');
      setTenant(await tenantService.updateCustomization(payload));
      toast.success('Identidade visual salva.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }
  if (loading) return <div className="p-8">Carregando identidade visual…</div>;
  if (error)
    return (
      <div className="p-8">
        <p>{error}</p>
        <Button onClick={() => void reload()}>Tentar novamente</Button>
      </div>
    );
  if (!owner)
    return (
      <div className="p-8">
        A identidade visual pode ser editada pelo administrador proprietário da loja.
      </div>
    );
  return (
    <main className="p-6 lg:p-10 max-w-4xl">
      <h1 className="text-2xl font-bold">Identidade visual</h1>
      <p className="text-muted-foreground mt-2">
        Personalize a marca da sua concessionária. A prévia é aplicada enquanto você edita.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-6 bg-white rounded-xl p-6">
        <label className="block">
          Nome da loja
          <input
            maxLength={120}
            required
            value={draft.displayName || ''}
            onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
            className="block border rounded-lg p-3 w-full mt-2"
          />
        </label>
        <div className="grid sm:grid-cols-3 gap-4">
          {(
            [
              ['primaryColor', 'Cor principal'],
              ['secondaryColor', 'Cor secundária'],
              ['accentColor', 'Highlight'],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                type="color"
                value={draft[key] || DEFAULT_COLORS[key]}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                className="block w-full h-12 mt-2"
              />
            </label>
          ))}
        </div>
        {(
          [
            ['logoLightUrl', 'Logo para fundo claro'],
            ['logoDarkUrl', 'Logo para fundo escuro'],
            ['faviconUrl', 'Favicon'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block">
            {label}
            <input
              type="url"
              placeholder="https://…"
              value={draft[key] || ''}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              className="block border rounded-lg p-3 w-full mt-2"
            />
            <small className="text-muted-foreground">Informe a URL HTTPS da imagem.</small>
          </label>
        ))}
        <label className="block">
          Enviar logo principal
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading || saving}
            onChange={(e) => {
              void upload(e.target.files?.[0]);
              e.target.value = '';
            }}
            className="block mt-2"
          />
          <small>{uploading ? 'Enviando…' : 'PNG, JPEG ou WebP, até 5 MB.'}</small>
        </label>
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              ['openingTime', 'Abertura'],
              ['closingTime', 'Fechamento'],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                type="time"
                value={draft[key] || ''}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                className="block border rounded-lg p-3 mt-2 w-full"
              />
            </label>
          ))}
        </div>
        <fieldset>
          <legend>Dias de funcionamento</legend>
          <div className="flex flex-wrap gap-4 mt-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((label, day) => (
              <label key={day}>
                <input
                  type="checkbox"
                  checked={draft.workingDays?.includes(day) || false}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      workingDays: e.target.checked
                        ? [...(draft.workingDays || []), day]
                        : (draft.workingDays || []).filter((d) => d !== day),
                    })
                  }
                />{' '}
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-lg border p-5 bg-white">
            {safeAssetUrl(draft.logoLightUrl) && (
              <img
                src={safeAssetUrl(draft.logoLightUrl)!}
                alt="Prévia da logo em fundo claro"
                className="max-h-16 max-w-full object-contain"
              />
            )}
            <small className="block mt-2 text-muted-foreground">Logo em fundo claro</small>
          </div>
          <div className="rounded-lg p-5 bg-secondary text-secondary-foreground">
            {safeAssetUrl(draft.logoDarkUrl) && (
              <img
                src={safeAssetUrl(draft.logoDarkUrl)!}
                alt="Prévia da logo em fundo escuro"
                className="max-h-16 max-w-full object-contain mb-3"
              />
            )}
            <strong>{draft.displayName || 'Sua concessionária'}</strong>
            <div className="flex gap-3 mt-4">
              <Button type="button">Negociação</Button>
              <span className="bg-accent text-accent-foreground p-2 rounded-lg">Destaque</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving || uploading}>
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </Button>
          <Button type="button" variant="outline" onClick={() => tenant && setDraft(tenant)}>
            Cancelar prévia
          </Button>
        </div>
      </form>
    </main>
  );
}
