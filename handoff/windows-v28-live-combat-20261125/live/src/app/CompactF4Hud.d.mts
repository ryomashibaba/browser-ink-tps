import type { createF3PlayableHud } from './UndertowF3PlayableHud';
type LegacyHud = ReturnType<typeof createF3PlayableHud>;

export function installCompactF4Hud(legacy: LegacyHud, options: {
  visible(): boolean;
  readKit(): { weapon: string; sub: string; subCost: number; subUsable: boolean; special: string; controls: string; probe?: boolean; turfLabel?:string };
  readSpecial(): { authorityComplete: boolean; provisional?:boolean; executorReady: boolean; required?: number; points?: number; ready?: boolean; active: boolean;
    probeState?: 'AVAILABLE'|'ACTIVE'|'LOCKED'|'USED'|'UNSUPPORTED'; probeControls?: string; activationNotice?:string;readyControls?:string } | null;
}): LegacyHud & { refreshCompactVisibility(): void; disposeCompact(): void };

