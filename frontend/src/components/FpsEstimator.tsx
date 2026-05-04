import { useMemo, useState } from 'react';
import { useTranslation } from '../i18n/I18nContext';

type GpuClass = 'weak' | 'entry' | 'mid' | 'high' | 'flagship';

interface GpuClassInfo {
  key: GpuClass;
  /** Relative GPU score, where mid (e.g. RTX 2060) ≈ 100. */
  score: number;
  labelKey:
    | 'fps.preset.weak'
    | 'fps.preset.entry'
    | 'fps.preset.mid'
    | 'fps.preset.high'
    | 'fps.preset.flagship';
}

const GPU_CLASSES: GpuClassInfo[] = [
  { key: 'weak', score: 25, labelKey: 'fps.preset.weak' },
  { key: 'entry', score: 55, labelKey: 'fps.preset.entry' },
  { key: 'mid', score: 100, labelKey: 'fps.preset.mid' },
  { key: 'high', score: 175, labelKey: 'fps.preset.high' },
  { key: 'flagship', score: 280, labelKey: 'fps.preset.flagship' },
];

/**
 * Estimated FPS at 1080p when running a game of `gameTier` (1=light, 5=AAA heavy)
 * on a GPU of `gpuScore` (mid-range = 100) at the given preset. Numbers are very
 * rough — meant only to give the user a ballpark.
 */
function estimateFps(gpuScore: number, gameTier: number, preset: 'low' | 'med' | 'high'): number {
  if (!gameTier || gameTier < 1) return 0;
  // Base load: target FPS at 1080p Medium for a mid GPU, by tier
  // tier 1 → 240, tier 2 → 200, tier 3 → 130, tier 4 → 80, tier 5 → 55
  const baseMidFps = [0, 240, 200, 130, 80, 55][Math.min(5, Math.max(1, gameTier))];
  const presetMul = preset === 'low' ? 1.6 : preset === 'med' ? 1 : 0.65;
  const fps = (gpuScore / 100) * baseMidFps * presetMul;
  return Math.max(5, Math.round(fps));
}

/** Try to map a WebGL renderer string to a GPU class score. */
function detectGpuClass(): { className: GpuClass | null; rawName: string | null } {
  if (typeof document === 'undefined') return { className: null, rawName: null };
  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return { className: null, rawName: null };
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let rendererStr = '';
    if (debugInfo) {
      rendererStr = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '');
    }
    if (!rendererStr) {
      rendererStr = String(gl.getParameter(gl.RENDERER) || '');
    }
    const r = rendererStr.toLowerCase();
    if (!r) return { className: null, rawName: null };

    // Flagship
    if (
      /rtx\s*40(70|80|90)/.test(r) ||
      /rtx\s*50\d{2}/.test(r) ||
      /rx\s*7900/.test(r) ||
      /rx\s*7800/.test(r)
    ) {
      return { className: 'flagship', rawName: rendererStr };
    }
    // High-end
    if (
      /rtx\s*30(70|80|90)/.test(r) ||
      /rtx\s*40(60|70)/.test(r) ||
      /rtx\s*20(80|90)/.test(r) ||
      /rx\s*6700/.test(r) ||
      /rx\s*6800/.test(r) ||
      /rx\s*6900/.test(r) ||
      /rx\s*7700/.test(r)
    ) {
      return { className: 'high', rawName: rendererStr };
    }
    // Mid-range
    if (
      /rtx\s*20(60|70)/.test(r) ||
      /rtx\s*30(50|60)/.test(r) ||
      /rtx\s*40(50)/.test(r) ||
      /gtx\s*16(60|70|80)/.test(r) ||
      /rx\s*5(600|700)/.test(r) ||
      /rx\s*6600/.test(r) ||
      /m\d\b/.test(r) ||
      /apple\s*m\d/.test(r)
    ) {
      return { className: 'mid', rawName: rendererStr };
    }
    // Entry
    if (
      /gtx\s*10(50|60)/.test(r) ||
      /gtx\s*16(50)/.test(r) ||
      /rx\s*5(50|60|70)\b/.test(r) ||
      /vega/.test(r) ||
      /iris\s*xe/.test(r)
    ) {
      return { className: 'entry', rawName: rendererStr };
    }
    // Weak / integrated
    if (
      /intel.*hd\s*graphics/.test(r) ||
      /intel.*uhd/.test(r) ||
      /intel.*iris/.test(r) ||
      /apple.*gpu/.test(r) ||
      /mali/.test(r) ||
      /adreno/.test(r) ||
      /swiftshader/.test(r) ||
      /llvmpipe/.test(r) ||
      /software/.test(r)
    ) {
      return { className: 'weak', rawName: rendererStr };
    }
    // Default: assume mid if we got something but couldn't parse
    return { className: 'mid', rawName: rendererStr };
  } catch {
    return { className: null, rawName: null };
  }
}

interface Props {
  gameTier: number;
}

export function FpsEstimator({ gameTier }: Props) {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<GpuClass | null>(null);
  const [detected, setDetected] = useState<{
    className: GpuClass | null;
    rawName: string | null;
  } | null>(null);

  const activeClass: GpuClass | null = picked || detected?.className || null;
  const activeInfo = useMemo(
    () => (activeClass ? GPU_CLASSES.find((g) => g.key === activeClass) || null : null),
    [activeClass]
  );

  if (!gameTier || gameTier < 1) {
    return (
      <section className="fps-card">
        <header className="fps-card__head">
          <div>
            <span className="fps-card__eyebrow">FPS</span>
            <h2 className="fps-card__title">{t('fps.title')}</h2>
          </div>
        </header>
        <p className="fps-card__muted">{t('fps.not_set')}</p>
      </section>
    );
  }

  function handleDetect() {
    const r = detectGpuClass();
    setDetected(r);
    setPicked(null);
  }

  const lowFps = activeInfo ? estimateFps(activeInfo.score, gameTier, 'low') : 0;
  const medFps = activeInfo ? estimateFps(activeInfo.score, gameTier, 'med') : 0;
  const highFps = activeInfo ? estimateFps(activeInfo.score, gameTier, 'high') : 0;

  function fpsTone(fps: number): 'good' | 'ok' | 'bad' {
    if (fps >= 60) return 'good';
    if (fps >= 30) return 'ok';
    return 'bad';
  }

  return (
    <section className="fps-card">
      <div className="fps-card__bg" aria-hidden="true" />
      <header className="fps-card__head">
        <div>
          <span className="fps-card__eyebrow">FPS · 1080p</span>
          <h2 className="fps-card__title">{t('fps.title')}</h2>
          <p className="fps-card__sub">{t('fps.subtitle')}</p>
        </div>
        <button type="button" className="btn btn--ghost fps-card__detect" onClick={handleDetect}>
          {t('fps.detect')}
        </button>
      </header>

      {detected && detected.rawName ? (
        <div className="fps-card__detected">
          <span className="fps-card__label">{t('fps.yourGpu')}:</span>
          <code>{detected.rawName}</code>
        </div>
      ) : null}

      <div className="fps-card__picker">
        <span className="fps-card__label">{t('fps.pickGpu')}</span>
        <div className="fps-card__chips">
          {GPU_CLASSES.map((g) => {
            const isActive = activeClass === g.key;
            return (
              <button
                key={g.key}
                type="button"
                className={`fps-chip${isActive ? ' is-active' : ''}`}
                onClick={() => setPicked(g.key)}
              >
                {t(g.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {activeInfo ? (
        <div className="fps-card__results">
          <div className={`fps-result fps-result--${fpsTone(lowFps)}`}>
            <span className="fps-result__preset">{t('fps.lowSettings')}</span>
            <span className="fps-result__num">{lowFps}</span>
            <span className="fps-result__unit">FPS</span>
          </div>
          <div className={`fps-result fps-result--${fpsTone(medFps)}`}>
            <span className="fps-result__preset">{t('fps.medSettings')}</span>
            <span className="fps-result__num">{medFps}</span>
            <span className="fps-result__unit">FPS</span>
          </div>
          <div className={`fps-result fps-result--${fpsTone(highFps)}`}>
            <span className="fps-result__preset">{t('fps.highSettings')}</span>
            <span className="fps-result__num">{highFps}</span>
            <span className="fps-result__unit">FPS</span>
          </div>
        </div>
      ) : (
        <p className="fps-card__muted">{t('fps.unsupported')}</p>
      )}

      <p className="fps-card__note">{t('fps.note')}</p>
    </section>
  );
}
