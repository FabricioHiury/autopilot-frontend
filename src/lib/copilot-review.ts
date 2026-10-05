import type { CopilotInsight } from '@/types/copilot';
export function dossierDescription(
  existing: string,
  dossier: CopilotInsight['leadDossier'],
): string {
  const block = `[Dossiê AutoPilot]\nVeículo: ${dossier.vehicleOfInterest || 'Não identificado'}\nTroca: ${dossier.hasTradeIn === false ? 'Sem troca' : dossier.tradeInVehicle || 'Não identificada'}\nPagamento: ${dossier.paymentMethod || 'Não identificado'}\nObjeção: ${dossier.mainObjection || 'Não identificada'}\n[/Dossiê AutoPilot]`;
  const pattern = /\[Dossiê AutoPilot\][\s\S]*?\[\/Dossiê AutoPilot\]/;
  return pattern.test(existing)
    ? existing.replace(pattern, () => block)
    : `${existing}${existing ? '\n\n' : ''}${block}`;
}
