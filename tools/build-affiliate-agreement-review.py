"""Create the blank interactive agreement that Glenn and Leon can review.

This review artifact is deliberately separate from the live signing packet.
No economic terms, legal identity, consent or signature is supplied for them.
"""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.utils import simpleSplit
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf'
OUT.mkdir(parents=True, exist_ok=True)
FILE = OUT / 'BEASTY-Affiliate-Agreement-Fillable-DRAFT.pdf'
W, H = 612, 792
c = canvas.Canvas(str(FILE), pagesize=(W, H))
c.setTitle('BEASTY affiliate agreement - fillable review draft')
c.setAuthor('BEASTY Pages')
names = []


def paragraph(text, y, size=10, width=528):
    c.setFillColor(black)
    c.setFont('Helvetica', size)
    for line in simpleSplit(text, 'Helvetica', size, width):
        c.drawString(42, y, line)
        y -= size * 1.45
    return y - 10


def header(title, subtitle, page):
    c.setFillColor(HexColor('#f1d600'))
    c.rect(0, H - 18, W, 18, fill=1, stroke=0)
    c.setFillColor(black)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(42, 744, 'BEASTY PAGES / AGREEMENT REVIEW')
    c.setFont('Helvetica-Bold', 22)
    c.drawString(42, 710, title)
    paragraph(subtitle, 684, 10)
    c.setFont('Helvetica-Bold', 8)
    c.drawString(42, 28, 'DRAFT / COMPLETE FOR DISCUSSION / NOT FOR APPLICANT SIGNING')
    c.setFont('Helvetica', 8)
    c.drawRightString(570, 28, f'{page} / 4')


def field(name, label, y, height=28, x=42, width=528, multiline=False):
    names.append(name)
    c.setFillColor(black)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(x, y + height + 7, label)
    c.acroForm.textfield(
        name=name, tooltip=label, x=x, y=y, width=width, height=height,
        value='', fontName='Helvetica', fontSize=10,
        borderColor=HexColor('#9b9b9b'), fillColor=HexColor('#fafafa'),
        textColor=black, borderWidth=0.7, forceBorder=True,
        fieldFlags='multiline' if multiline else '', maxlen=1500 if multiline else 180,
    )


header('Company & reward schedule',
       'Type into the shaded boxes, save a copy, and review it together. All commercial and legal terms are blank for you and Glenn to decide.', 1)
field('Company legal name', 'BEASTY legal company name', 590)
field('Company address', 'Company mailing address', 527, 34, multiline=True)
field('Company representative', 'Authorized representative / title', 468, width=330)
field('Agreement version', 'Version / review date', 468, x=390, width=180)
field('Company notices email', 'Company contact / notices email', 409)
field('User reward', 'Reward per qualifying user referral (amount / points / rate)', 350)
field('Business reward', 'Reward per qualifying business referral (amount / points / rate)', 291)
field('Reward basis', 'One-time or recurring; if recurring, duration and calculation', 224, 36, multiline=True)
field('Point value', 'Value per point / currency (if applicable)', 163, width=252)
field('Minimum payout', 'Minimum redemption / payout amount', 163, x=318, width=252)
field('Payout schedule', 'Payout frequency and deadline; who initiates redemption', 85, 45, multiline=True)
c.showPage()

header('Qualification & administration',
       'Complete these rules before using the agreement. Attach a written schedule if more space is needed; identify that schedule below.', 2)
field('Eligible referral', 'What qualifies a user or business referral? Required activation / payment', 564, 56, multiline=True)
field('Attribution', 'Referral tracking, attribution window, duplicate / existing customer rules', 469, 56, multiline=True)
field('Refund rules', 'Cancellations, refunds, fraud, chargebacks and adjustment / dispute rules', 374, 56, multiline=True)
field('Final payment', 'Earned rewards and payment deadline when participation ends', 291, 44, multiline=True)
field('Tax deductions', 'Permitted tax withholding / deductions and reporting responsibilities', 208, 44, multiline=True)
field('Privacy retention', 'Privacy notice URL, document retention, access and deletion contact', 125, 44, multiline=True)
field('Attached schedule', 'Additional schedule title / version (or none)', 62, 28)
c.showPage()

header('Draft agreement',
       'The completed terms on pages 1 and 2 become Schedule A. Both parties must review the whole agreement before a final signing request is created.', 3)
y = 635
sections = [
    ('1. Parties and purpose',
     'The company identified on page 1, doing business as BEASTY Pages (BEASTY), and the affiliate identified on page 4 agree that the affiliate may promote BEASTY and refer users and businesses. The final agreement takes effect when both parties sign it.'),
    ('2. Independent relationship',
     'The affiliate controls their promotional work and expenses. They may not bind BEASTY, collect money for BEASTY, or make promises BEASTY has not authorized. The parties intend an independent contractor relationship; any legally required classification controls.'),
    ('3. Rewards and payment',
     'Eligible, recorded referrals earn the rewards in completed Schedule A. BEASTY supplies a statement of eligible referrals, adjustments and amounts payable. Payment follows the completed payout schedule. The affiliate supplies accurate tax and payout information through the secure forms requested by BEASTY.'),
    ('4. Promotion and disclosures',
     'Promotions must be truthful, comply with applicable laws, and clearly disclose the affiliate relationship when recommending BEASTY. Use approved brand assets and current offers. Do not misrepresent earnings, buy fake referrals, misuse another person\'s identity or send unlawful unsolicited messages.'),
    ('5. Information and privacy',
     'The affiliate provides tax forms, bank details and requested ID directly through DocuSeal. BEASTY uses these documents for onboarding, payment and applicable tax reporting, with access limited to authorized personnel. The privacy notice, retention period and correction contact are stated in Schedule A. Do not send completed sensitive forms by ordinary email.'),
    ('6. Ending participation',
     'Either party may end participation by written notice, subject to the notice period on page 4. BEASTY may suspend participation while reviewing suspected fraud or misuse. Validly earned amounts remain payable under Schedule A and its agreed adjustment rules. The affiliate stops using BEASTY brand assets when participation ends.'),
    ('7. Entire agreement and changes',
     'This agreement and completed Schedule A state the parties\' arrangement. Changes require notice and agreement before affecting future referrals. No guaranteed earnings, exclusivity, automatic payout or promotional multiplier is included unless expressly stated in the completed agreement. Neither party signs on the other\'s behalf.'),
]
for title, text in sections:
    c.setFont('Helvetica-Bold', 10)
    c.drawString(42, y, title)
    y = paragraph(text, y - 17, 10) - 7
assert y > 55, f'Agreement text overflows: {y}'
c.showPage()

header('Legal details & execution',
       'Review copy only. Complete the blank terms, approve the final version, then create a separate DocuSeal request for the affiliate and BEASTY to sign.', 4)
field('Governing law', 'Governing law (jurisdiction)', 589, width=252)
field('Venue', 'Agreed venue / dispute process', 589, x=318, width=252)
field('Notice period', 'Termination notice period and notice method', 511, 44, multiline=True)
field('Additional terms', 'Other agreed terms / exceptions (or none)', 402, 72, multiline=True)
field('Affiliate name', 'Affiliate legal name (complete when preparing a final request)', 339)
field('Affiliate notices', 'Affiliate contact / notices address', 267, 40, multiline=True)
paragraph('Execution in the final DocuSeal request', 229, 12)
paragraph('Affiliate and BEASTY each sign their own fields. DocuSeal records the signing dates and audit evidence. The blank boxes below are reserved for that final request; this review copy does not collect a signature.', 207, 10)
for x, label in [(42, 'Affiliate signature'), (318, 'BEASTY authorized signature')]:
    c.setFont('Helvetica-Bold', 9)
    c.drawString(x, 138, label)
    c.setStrokeColor(HexColor('#9b9b9b'))
    c.rect(x, 91, 252, 38)
    c.setFont('Helvetica', 8)
    c.drawString(x, 77, 'Signing date: recorded by DocuSeal')
c.save()

reader = PdfReader(FILE)
assert len(reader.pages) == 4
assert set(reader.get_fields()) == set(names)
assert all(not f.get('/V') for f in reader.get_fields().values())
widgets = [a.get_object() for p in reader.pages for a in p.get('/Annots', [])
           if a.get_object().get('/Subtype') == '/Widget']
assert len(widgets) == len(names)
assert all(w.get('/AP', {}).get('/N') for w in widgets)

# Prove edits persist in the canonical tree and in appearances, without
# inserting any example values into the deliverable itself.
probe = ROOT / 'out/affiliate-forms/agreement-fill-test.pdf'
probe.parent.mkdir(parents=True, exist_ok=True)
writer = PdfWriter(); writer.clone_document_from_reader(reader)
values = {'Company legal name': 'TEST COMPANY - REVIEW ONLY',
          'Eligible referral': 'TEST RULE LINE ONE\nTEST RULE LINE TWO',
          'Governing law': 'TEST JURISDICTION'}
writer.update_page_form_field_values(None, values, auto_regenerate=False)
with probe.open('wb') as stream:
    writer.write(stream)
filled = PdfReader(probe)
for name, value in values.items():
    assert filled.get_fields()[name]['/V'] == value
    matching = [a.get_object() for p in filled.pages for a in p.get('/Annots', [])
                if a.get_object().get('/T') == name]
    assert len(matching) == 1 and matching[0]['/V'] == value
    assert matching[0]['/AP']['/N'].get_object().get_data()
print(f'Created {FILE}: 4 pages, {len(names)} interactive fields; persisted fill test passed.')
