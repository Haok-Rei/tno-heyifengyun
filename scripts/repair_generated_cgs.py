"""Offline cleanup of confirmed AI CGs; never overwrites input files.

Run using repair-ai-image-quality's private Python runtime. The skill's learned
filter handles AI microtexture. An additional edge-aware luminance pass reduces
the deliberate heavy canvas grain that its spectral detector does not classify.
Review the comparisons before replacing source artwork. Do not run on user photos.
"""

import argparse
import hashlib
import json
import sys
from pathlib import Path


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('images', nargs='+', type=Path)
    ap.add_argument('--skill-dir', type=Path, required=True)
    ap.add_argument('--out-dir', type=Path, required=True)
    ap.add_argument('--strength', type=float, default=40)
    ap.add_argument('--surface-strength', type=float, default=0.85)
    args = ap.parse_args()
    assert 0 <= args.strength <= 60
    assert 0 <= args.surface_strength <= 1
    args.out_dir.mkdir(parents=True, exist_ok=True)
    assert len({p.stem for p in args.images}) == len(args.images), 'Duplicate output names'
    sys.path.insert(0, str(args.skill_dir / 'scripts'))
    import cv2
    import numpy as np
    import gpt_demaze as gd
    from common import comparison_board, load_image, luma, save_image, to_pil
    cv2.setNumThreads(2)
    results = []
    for source in args.images:
        dest = args.out_dir / f'{source.stem}_fixed.png'
        assert dest.resolve() != source.resolve(), 'Never overwrite the original'
        rgb, info = load_image(source)
        # Explicit force is intentional: these confirmed AI paintings have broad
        # canvas texture rather than the skill's narrow labyrinth spectral signature.
        learned, skill_report, _ = gd.process(rgb, info, str(source), args.strength, True, None, 'gpt')
        if skill_report.get('method') != 'unet':
            raise RuntimeError(f'Learned filter unavailable: {skill_report}')
        Y = (luma(learned) * 255).astype(np.float32)
        low = cv2.GaussianBlur(Y, (0, 0), 3)
        grad = np.hypot(cv2.Sobel(low, cv2.CV_32F, 1, 0), cv2.Sobel(low, cv2.CV_32F, 0, 1))
        # This does not blur across sharp boundaries. Strong object-scale edges
        # receive less smoothing, while skies, plaster, shadows and cloth receive more.
        amount = args.surface_strength * (0.08 + 0.92 * np.exp(-(grad / 24) ** 2))
        clean = cv2.bilateralFilter(Y, 21, 20, 5)
        corrected = np.clip(learned + ((clean - Y) * amount / 255)[..., None], 0, 1)
        save_image(dest, corrected, info)
        y0, y1 = (luma(a) * 255 for a in (rgb, corrected))
        high0 = y0 - cv2.GaussianBlur(y0, (0, 0), 1.5)
        high1 = y1 - cv2.GaussianBlur(y1, (0, 0), 1.5)
        flat = grad < np.percentile(grad, 55)
        rms0 = float(np.sqrt(np.mean(high0[flat] ** 2)))
        rms1 = float(np.sqrt(np.mean(high1[flat] ** 2)))
        record = {
            'name': source.stem,
            'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
            'output_sha256': hashlib.sha256(dest.read_bytes()).hexdigest(),
            'dimensions': [rgb.shape[1], rgb.shape[0]],
            'skill': skill_report,
            'surface_cleanup': {
                'method': 'edge-aware bilateral luminance',
                'strength': args.surface_strength,
                'sigma_color': 20, 'sigma_space': 5,
                'low_gradient_high_frequency_rms_before': round(rms0, 4),
                'low_gradient_high_frequency_rms_after': round(rms1, 4),
                'texture_rms_reduction_fraction': round(1 - rms1 / max(rms0, 1e-6), 4),
                'edge_correlation': round(gd.edge_preservation(y0, y1), 6),
                'luma_mae_255': round(float(np.abs(y1 - y0).mean()), 4),
            },
        }
        assert record['surface_cleanup']['edge_correlation'] >= 0.995, f'Edge review needed: {source.stem}'
        h, w = rgb.shape[:2]
        crops = [(int(w * .40), int(h * .07), int(w * .64), int(h * .39)),
                 (int(w * .44), int(h * .44), int(w * .68), int(h * .76))]
        comparison_board(args.out_dir / f'{source.stem}_compare.png', source.stem,
                         f"Low-gradient texture reduction {1-rms1/max(rms0,1e-6):.0%}; edge correlation {record['surface_cleanup']['edge_correlation']:.4f}",
                         [('Before', to_pil(rgb)), ('After', to_pil(corrected))], crops=crops)
        results.append(record)
        (args.out_dir / 'report.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
        print(json.dumps(record, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
