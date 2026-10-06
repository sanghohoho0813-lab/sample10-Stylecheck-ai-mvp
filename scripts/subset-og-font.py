"""
Builds the tiny Korean font used by the link-preview images (lib/og.tsx).

next/og renders text with the fonts it is given and has no Korean glyphs of
its own. Shipping full Pretendard (2.6 MB per weight) to a serverless
function is wasteful, so this keeps only the characters the preview can ever
contain: every Hangul syllable that appears in lib/ and the OG templates,
plus printable ASCII.

Usage:  pip install fonttools
        python3 scripts/subset-og-font.py <path-to-Pretendard-ttf-dir>

Pretendard is SIL OFL 1.1 with the Reserved Font Name "Pretendard", so the
subset is renamed (OFL §3) and ships with the licence next to it.
"""
import pathlib
import re
import shutil
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCES = [*ROOT.glob("lib/*.ts"), *ROOT.glob("lib/*.tsx")]
OUT = ROOT / "assets" / "fonts"
FAMILY = "StyleCheck OG Sans"

text = "".join(p.read_text(encoding="utf-8") for p in SOURCES)
hangul = sorted(set(re.findall(r"[가-힣]", text)))
chars = "".join(hangul) + "".join(chr(c) for c in range(0x20, 0x7F)) + "·—→…‘’“”−"

src_dir = pathlib.Path(sys.argv[1])
for weight in ("Medium", "Bold"):
    options = subset.Options()
    options.layout_features = ["kern"]  # the previews need spacing, not alternates
    options.name_IDs = ["*"]
    options.hinting = False
    font = TTFont(src_dir / f"Pretendard-{weight}.ttf")
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=chars)
    subsetter.subset(font)
    for record in font["name"].names:
        if record.nameID in (1, 4, 16):
            record.string = FAMILY if record.nameID != 4 else f"{FAMILY} {weight}"
        elif record.nameID == 6:
            record.string = f"StyleCheckOGSans-{weight}"
    target = OUT / f"og-sans-{weight.lower()}.ttf"
    font.save(target)
    print(f"{target.relative_to(ROOT)}  {target.stat().st_size // 1024} KB  ({len(hangul)} Hangul)")

shutil.copy(src_dir.parent.parent.parent / "LICENSE.txt", OUT / "OFL-Pretendard.txt")
