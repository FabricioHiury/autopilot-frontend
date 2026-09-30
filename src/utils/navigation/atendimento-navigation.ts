type DeviceType = 'mobile' | 'desktop';

interface DeviceSignals {
    uaDataMobile?: boolean;
    maxTouchPoints: number;
    pointerCoarse: boolean;
    hoverNone: boolean;
    width: number;
    height: number;
    smallViewport: boolean;
}

const hasWindow = typeof window !== 'undefined';
const hasNavigator = typeof navigator !== 'undefined';

function getSignals(): DeviceSignals {
    if (!hasWindow || !hasNavigator) {
        return {
            uaDataMobile: undefined,
            maxTouchPoints: 0,
            pointerCoarse: false,
            hoverNone: false,
            width: 1920,
            height: 1080,
            smallViewport: false,
        };
    }

    const maxTouchPoints = navigator.maxTouchPoints ?? 0;
    const mq = (q: string) =>
        typeof window.matchMedia === 'function' ? window.matchMedia(q).matches : false;

    const width = Math.max(0, window.innerWidth || 0);
    const height = Math.max(0, window.innerHeight || 0);

    // @ts-expect-error: userAgentData may not exist in all environments
    const uaDataMobile: boolean | undefined = navigator.userAgentData?.mobile;

    const pointerCoarse = mq('(pointer: coarse)');
    const hoverNone = mq('(hover: none)');
    const smallViewport = mq('(max-width: 768px)');

    return {
        uaDataMobile,
        maxTouchPoints,
        pointerCoarse,
        hoverNone,
        width,
        height,
        smallViewport,
    };
}

export function isMobileDevice(): boolean {
    if (hasWindow && 'localStorage' in window) {
        const override = localStorage.getItem('deviceOverride') as DeviceType | null;
        if (override === 'mobile') return true;
        if (override === 'desktop') return false;
    }

    const s = getSignals();
    let score = 0;

    if (s.uaDataMobile === true) score += 3;
    if (s.pointerCoarse) score += 2;
    if (s.hoverNone) score += 1;
    if (s.maxTouchPoints > 0) score += 2;
    if (s.smallViewport) score += 1;

    return score >= 4;
}

export function detectDevice(): DeviceType {
    return isMobileDevice() ? 'mobile' : 'desktop';
}

function buildAtendimentoUrl(idAtendimento: string): string {
    const path = `/app/atendimentos/painel-de-atendimentos/${encodeURIComponent(idAtendimento)}`;
    if (!hasWindow) return path;
    const u = new URL(path, window.location.origin);
    return u.toString();
}

function safeOpenNewTab(url: string): void {
    if (!hasWindow) return;

    try {
        const w = window.open(url, '_blank', 'noopener,noreferrer');
        if (w && 'opener' in w) {
            try {
                (w as any).opener = null;
            } catch { }
        }
    } catch (error) {
        console.warn('Não foi possível abrir nova aba:', error);
    }
}

export function navigateToAtendimento(idAtendimento: string): void {
    const url = buildAtendimentoUrl(idAtendimento);
    if (!hasWindow) return;
    if (isMobileDevice()) {
        window.location.assign(url);
    } else {
        safeOpenNewTab(url);
    }
}

export function useDeviceDetection() {
    const deviceType = detectDevice();
    const isMobile = deviceType === 'mobile';
    const isDesktop = !isMobile;

    return {
        deviceType,
        isMobile,
        isDesktop,
        navigateToAtendimento,
    };
}
