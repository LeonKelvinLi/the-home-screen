"""Read-only disclosures shared with the applicant page, for BEASTY review."""
import json
from pathlib import Path
from affiliate_form_design import header, section, paragraph, BODY, MUTED
from reportlab.pdfbase.pdfmetrics import stringWidth

DISCLOSURES = json.loads((Path(__file__).resolve().parents[1] / 'src/join/disclosures.json').read_text())


def draw_disclosures(c, start_page=1, total=2, category='Affiliate disclosures / review'):
    for index in range(2):
        header(c, 'Before you sign' if index == 0 else 'Your affiliate responsibilities',
               'Written disclosures for BEASTY review. Read them with the final agreement; you do not need to write disclosure text.',
               draft=True, page=start_page + index, total=total, category=category)
        y = 617
        for number, item in enumerate(DISCLOSURES[index * 4:index * 4 + 4], index * 4 + 1):
            section(c, number, item['title'], y)
            y = paragraph(c, item['text'], 44, y - 21, 524, 9.6, leading=13.2) - 16
        assert y > 55, f'Disclosures overflow: {y}'
        if index == 1:
            c.setFillColor(MUTED); c.setFont(BODY, 7.5)
            c.drawString(44, 81, 'Reference guidance:')
            x = 126
            for label, url in [
                ('IRS Form W-9', 'https://www.irs.gov/forms-pubs/about-form-w-9'),
                ('FTC affiliate disclosures', 'https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers'),
                ('DocuSeal e-sign disclosure', 'https://www.docuseal.com/esign-disclosure'),
            ]:
                width = stringWidth(label, BODY, 7.5)
                c.drawString(x, 81, label)
                c.linkURL(url, (x, 79, x + width, 89), relative=0)
                x += width + 16
        if index == 0:
            c.showPage()
