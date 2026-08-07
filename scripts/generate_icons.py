#!/usr/bin/env python3
"""Generate realpomodoro extension icons (tomato / timer circle metaphor)."""

from __future__ import annotations

import math
import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "Pillow is required. Install with: pip install pillow"
    ) from exc

ROOT = Path(__file__).resolve().parent.parent
ICONS_DIR = ROOT / "icons"
SIZES = (16, 32, 48, 128)

FOCUS_CORAL = (232, 93, 76, 255)
FOCUS_CORAL_DARK = (200, 70, 58, 255)
LEAF_GREEN = (76, 175, 125, 255)
RING_TRACK = (255, 255, 255, 60)
BG_TOP = (255, 245, 242, 255)
BG_BOTTOM = (250, 236, 232, 255)


def lerp_color(start: tuple[int, ...], end: tuple[int, ...], t: float) -> tuple[int, ...]:
    return tuple(int(start[i] + (end[i] - start[i]) * t) for i in range(len(start)))


def draw_icon(size: int) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    for y in range(size):
        t = y / max(size - 1, 1)
        row_color = lerp_color(BG_TOP, BG_BOTTOM, t)
        draw.line([(0, y), (size, y)], fill=row_color)

    center = size / 2
    outer_radius = size * 0.42
    inner_radius = size * 0.30
    ring_width = max(2, int(size * 0.07))

    draw.ellipse(
        [
            center - outer_radius,
            center - outer_radius,
            center + outer_radius,
            center + outer_radius,
        ],
        outline=RING_TRACK,
        width=ring_width,
    )

    arc_box = [
        center - outer_radius + ring_width * 0.5,
        center - outer_radius + ring_width * 0.5,
        center + outer_radius - ring_width * 0.5,
        center + outer_radius - ring_width * 0.5,
    ]
    draw.arc(arc_box, start=300, end=120, fill=FOCUS_CORAL, width=ring_width)

    tomato_box = [
        center - inner_radius,
        center - inner_radius * 0.85,
        center + inner_radius,
        center + inner_radius * 1.05,
    ]
    draw.ellipse(tomato_box, fill=FOCUS_CORAL)

    highlight_radius = inner_radius * 0.35
    highlight_box = [
        center - inner_radius * 0.45,
        center - inner_radius * 0.55,
        center - inner_radius * 0.45 + highlight_radius,
        center - inner_radius * 0.55 + highlight_radius,
    ]
    draw.ellipse(highlight_box, fill=(255, 255, 255, 90))

    stem_width = max(2, int(size * 0.06))
    stem_top = center - inner_radius * 1.05
    stem_bottom = center - inner_radius * 0.75
    draw.line(
        [(center, stem_top), (center, stem_bottom)],
        fill=FOCUS_CORAL_DARK,
        width=stem_width,
    )

    leaf_size = max(3, int(size * 0.12))
    leaf_center_x = center + inner_radius * 0.12
    leaf_center_y = stem_top + leaf_size * 0.4
    draw.ellipse(
        [
            leaf_center_x - leaf_size,
            leaf_center_y - leaf_size * 0.6,
            leaf_center_x + leaf_size * 0.4,
            leaf_center_y + leaf_size * 0.8,
        ],
        fill=LEAF_GREEN,
    )

    tick_length = max(2, int(size * 0.08))
    tick_y = center + outer_radius * 0.15
    draw.line(
        [(center, tick_y - tick_length), (center, tick_y + tick_length)],
        fill=(255, 255, 255, 180),
        width=max(1, int(size * 0.04)),
    )

    return image


def main() -> None:
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    for size in SIZES:
        icon = draw_icon(size)
        output_path = ICONS_DIR / f"icon-{size}.png"
        icon.save(output_path, format="PNG")
        print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()
