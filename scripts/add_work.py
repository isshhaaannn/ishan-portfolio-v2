"""Adds work that isn't in portfolio_db.json: Atomic Growth podcast thumbnails and
client work from BKClaude (Gulnar, CPS, CalCreme, Dom Joly, Amata).
Writes optimised files to public/projects/<folder>/ and src/data/extra_projects.json.
Run: python -I scripts/add_work.py
"""
import json, shutil
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / "public" / "projects"
BK = Path(r"C:\Users\iamth\BKClaude")
TH = BK / "Atomic Growth" / "thumbnails"
ASTRO = BK / "My Studio" / "Portfolio Site" / "public" / "work"  # already web-optimised

def thumb(src: Path, dst: Path):
    im = Image.open(src).convert("RGB"); im.thumbnail((1920, 1920), Image.LANCZOS)
    im.save(dst, "WEBP", quality=84, method=6)

def copy_dir(slug, pattern="*.webp"):
    return sorted(p for p in (ASTRO / slug).glob(pattern) if not p.stem.endswith("-s"))

PROJECTS = [
    # id, folder, name, category, buyer, sources (list of (src, kind))
    ("XP-001", "Atomic Growth MFM", "My First Million", "Thumbnails", "Media & podcasts", [
        TH / "My First Million/Mahjong/m1/40m a year from this 2.jpg",
        TH / "My First Million/Vanessa/3.1/04 Don’t smile more.png",
        TH / "My First Million/Vanessa/2.1/Artboard 1.png",
        TH / "My First Million/Vanessa/4.1/1.png",
        TH / "My First Million/David Rubenstein/_work/renders/r2b_tvwall@2x.png",
        TH / "My First Million/David Rubenstein/_work/renders/r2c_icons@2x.png",
    ]),
    ("XP-002", "Atomic Growth Generalist", "The Generalist", "Thumbnails", "Media & podcasts", [
        TH / "The Generalist/Craig Piggott/mexport/Generalist_Craig_T1_cow_v1.png",
        TH / "The Generalist/Craig Piggott/mexport/Host + Guest/05 Fences are obsolete_.png",
    ]),
    ("XP-003", "Atomic Growth TKP", "The Knowledge Project", "Thumbnails", "Media & podcasts", [
        TH / "The Knowledge Project/Morgan Housel/thumbnail/text_versions/export/TKP_Morgan_Housel_03_Fomo_Kills_Wealth_1920.jpg",
        TH / "The Knowledge Project/Morgan Housel/thumbnail/text_versions/export/TKP_Morgan_Housel_04_Wealth_is_the_Money_You_Dont_Spend_1920.jpg",
    ]),
    ("XP-004", "Gulnar", "Gulnar", "Brand Identity", "Consumer brands",
        [ASTRO / "film-gulnar/01-poster.webp", ASTRO / "film-gulnar/01.mp4"] + copy_dir("gulnar-identity")),
    ("XP-005", "CPS", "Centre for Policy Studies", "Social Systems", "Media & podcasts",
        [ASTRO / "film-cps/01-poster.webp", ASTRO / "film-cps/01.mp4"] + copy_dir("cps")),
    ("XP-006", "CalCreme", "CalCreme", "Motion", "Consumer brands",
        [ASTRO / "film-calcreme/01-poster.webp", ASTRO / "film-calcreme/01.mp4"]),
    ("XP-007", "Dom Joly", "Dom Joly", "Motion", "Media & podcasts",
        [ASTRO / "film-domjoly/01-poster.webp", ASTRO / "film-domjoly/01.mp4"]),
    ("XP-008", "Amata", "Amata Jute Tea", "Print & Objects", "Consumer brands", copy_dir("amata")),
]

out = []
for pid, folder, name, cat, buyer, sources in PROJECTS:
    d = PUB / folder; d.mkdir(parents=True, exist_ok=True)
    locs = []
    for i, src in enumerate(sources, 1):
        src = Path(src)
        if not src.exists():
            print("MISSING", src); continue
        if src.suffix.lower() == ".mp4":
            dst = d / f"{i:02d}.mp4"; shutil.copy2(src, dst)
        elif src.parent.is_relative_to(ASTRO):
            dst = d / f"{i:02d}.webp"; shutil.copy2(src, dst)
        else:
            dst = d / f"{i:02d}.webp"; thumb(src, dst)
        locs.append("/projects/" + folder + "/" + dst.name)
    out.append({"id": pid, "folder_name": folder, "website_project_name": name, "category_display": cat,
                "buyer": buyer, "asset_locations": locs})
    print(f"{name}: {len(locs)}")
(ROOT / "src/data").mkdir(exist_ok=True)
(ROOT / "src/data/extra_projects.json").write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding="utf-8")
