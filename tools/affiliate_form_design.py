"""BEASTY's document typography and layout; no data or signing behavior."""
from pathlib import Path
import sys
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont as ReportLabFont

ROOT = Path(__file__).resolve().parents[1]
local_dependencies = ROOT / '.verify/pdf-font-tools'
if local_dependencies.exists():
    sys.path.insert(0, str(local_dependencies))
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

INK = HexColor('#20252B')
MUTED = HexColor('#59616A')
RULE = HexColor('#D3D8DC')
ACCENT = HexColor('#F6D800')
FIELD = HexColor('#FAFBFC')
BODY = 'BeastyInter'
MEDIUM = 'BeastyInterMedium'
BOLD = 'BeastyInterBold'
DISPLAY = 'BeastyOswald'
LEFT, RIGHT = 44, 568


def register_fonts():
    cache = ROOT / 'out/affiliate-forms/fonts'
    cache.mkdir(parents=True, exist_ok=True)
    for name, source, weight in [
        (BODY, 'inter-latin.woff2', 400),
        (MEDIUM, 'inter-latin.woff2', 500),
        (BOLD, 'inter-latin.woff2', 600),
        (DISPLAY, 'oswald-latin.woff2', 600),
    ]:
        target = cache / (name + '.ttf')
        if not target.exists():
            font = TTFont(ROOT / 'public/fonts' / source)
            font = instantiateVariableFont(font, {'wght': weight}, inplace=True)
            font.flavor = None
            font.save(target)
        pdfmetrics.registerFont(ReportLabFont(name, str(target)))


def paragraph(c, text, x, y, width=524, size=10, leading=None, color=INK):
    c.setFillColor(color)
    c.setFont(BODY, size)
    for line in simpleSplit(text, BODY, size, width):
        c.drawString(x, y, line)
        y -= leading or size * 1.5
    return y - 10


def header(c, title, subtitle, draft=False, page=1, total=1, category='Affiliate program'):
    c.setFillColor(white)
    c.rect(0, 0, 612, 792, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont(DISPLAY, 20)
    c.drawString(LEFT, 749, 'BEASTY')
    c.setFont(MEDIUM, 8)
    c.setFillColor(MUTED)
    c.drawString(LEFT, 735, category)
    if draft:
        c.setStrokeColor(RULE); c.setFillColor(white)
        c.roundRect(447, 740, 121, 23, 3, stroke=1, fill=1)
        c.setFillColor(MUTED); c.setFont(BOLD, 7.8)
        c.drawCentredString(507.5, 748, 'REVIEW DRAFT')
    else:
        c.setFillColor(MUTED); c.setFont(MEDIUM, 8)
        c.drawRightString(RIGHT, 745, 'Complete securely in DocuSeal')
    c.setStrokeColor(RULE); c.setLineWidth(0.6); c.line(LEFT, 718, RIGHT, 718)
    c.setStrokeColor(ACCENT); c.setLineWidth(3); c.line(LEFT, 718, LEFT + 38, 718)
    c.setFillColor(INK); c.setFont(BOLD, 21)
    c.drawString(LEFT, 683, title)
    paragraph(c, subtitle, LEFT, 659, 524, 9.6, leading=14, color=MUTED)
    c.setStrokeColor(RULE); c.setLineWidth(0.6); c.line(LEFT, 47, RIGHT, 47)
    c.setFillColor(MUTED); c.setFont(MEDIUM, 7.2)
    c.drawString(LEFT, 32, 'BEASTY Pages  /  ' + ('Review only - not for applicant signing' if draft else 'Keep completed forms in DocuSeal'))
    c.drawRightString(RIGHT, 32, f'{page:02d} / {total:02d}')


def section(c, number, title, y):
    c.setFillColor(ACCENT); c.rect(LEFT, y - 1, 3, 10, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont(MEDIUM, 8)
    c.drawString(LEFT + 12, y, f'{number:02d}')
    c.setFillColor(INK); c.setFont(BOLD, 9.6)
    c.drawString(LEFT + 36, y, title)
    end = LEFT + 48 + pdfmetrics.stringWidth(title, BOLD, 9.6)
    c.setStrokeColor(RULE); c.setLineWidth(0.5); c.line(end, y + 3, RIGHT, y + 3)


register_fonts()
