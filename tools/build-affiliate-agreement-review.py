"""Create the blank interactive agreement that Glenn and Leon can review.

This review artifact is deliberately separate from the live signing packet.
No economic terms, legal identity, consent or signature is supplied for them.
"""
from pathlib import Path
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter
from affiliate_form_design import header as document_header, section, paragraph as document_paragraph, INK, MUTED, RULE, FIELD, BODY, BOLD

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
    return document_paragraph(c, text, 44, y, width, size, leading=size * 1.45)


def header(title, subtitle, page):
    document_header(c, title, subtitle, draft=True, page=page, total=4, category='Affiliate agreement / review')


def field(name, label, y, height=28, x=44, width=524, multiline=False):
    names.append(name)
    c.setFillColor(INK)
    c.setFont(BOLD, 8.7)
    c.drawString(x, y + height + 7, label)
    c.acroForm.textfield(
        name=name, tooltip=label, x=x, y=y, width=width, height=height,
        value='', fontName='Helvetica', fontSize=10,
        borderColor=RULE, fillColor=FIELD,
        textColor=INK, borderWidth=0.6, forceBorder=True,
        fieldFlags='multiline' if multiline else '', maxlen=1500 if multiline else 180,
    )


header('Affiliate agreement',
       'Complete the fields below with Glenn, save a copy, and agree the terms before preparing an applicant signing request.', 1)
section(c, 1, 'Company details', 617)
field('Company legal name', 'BEASTY legal company name', 556)
field('Company address', 'Company mailing address', 496, 36, multiline=True)
field('Company representative', 'Authorized representative / title', 440, width=328)
field('Agreement version', 'Version / review date', 440, x=388, width=180)
field('Company notices email', 'Company contact / notices email', 385)
section(c, 2, 'Reward schedule', 350)
field('User reward', 'Per qualifying user referral', 294, width=252)
field('Business reward', 'Per qualifying business referral', 294, x=316, width=252)
field('Reward basis', 'Amount, points or rate; one-time or recurring (include duration)', 232, 34, multiline=True)
field('Point value', 'Value per point / currency, if applicable', 177, width=252)
field('Minimum payout', 'Minimum redemption / payout amount', 177, x=316, width=252)
field('Payout schedule', 'Payout frequency, deadline and who initiates redemption', 101, 42, multiline=True)
c.showPage()

header('Qualification & administration',
       'Complete these rules before using the agreement. Attach a written schedule if more space is needed; identify that schedule below.', 2)
section(c, 1, 'Referral rules', 617)
field('Eligible referral', 'Qualifying activation / purchase for user and business referrals', 524, 58, multiline=True)
field('Attribution', 'Tracking, attribution window and duplicate / existing customer rules', 430, 58, multiline=True)
field('Refund rules', 'Cancellations, refunds, chargebacks and adjustment / dispute rules', 336, 58, multiline=True)
section(c, 2, 'Settlement & document handling', 307)
field('Final payment', 'Earned rewards and final payment when participation ends', 244, 38, multiline=True)
field('Tax deductions', 'Tax withholding / deductions and reporting responsibilities', 179, 38, multiline=True)
field('Privacy retention', 'Privacy notice URL, retention period, access and deletion contact', 114, 38, multiline=True)
field('Attached schedule', 'Additional schedule title / version (or none)', 63, 24)
c.showPage()

header('Agreement terms',
       'The completed terms on pages 1 and 2 become Schedule A. Both parties must review the whole agreement before a final signing request is created.', 3)
y = 617
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
    number, label = title.split('. ', 1)
    section(c, int(number), label, y)
    y = document_paragraph(c, text, 44, y - 20, 524, 9.6, leading=13.2) - 7
assert y > 55, f'Agreement text overflows: {y}'
c.showPage()

header('Legal details & signatures',
       'Review copy only. Complete the blank terms, approve the final version, then create a separate DocuSeal request for the affiliate and BEASTY to sign.', 4)
section(c, 1, 'Legal terms', 617)
field('Governing law', 'Governing law (jurisdiction)', 555, width=252)
field('Venue', 'Agreed venue / dispute process', 555, x=316, width=252)
field('Notice period', 'Termination notice period and notice method', 473, 44, multiline=True)
field('Additional terms', 'Other agreed terms / exceptions (or none)', 364, 72, multiline=True)
section(c, 2, 'Affiliate details', 338)
field('Affiliate name', 'Affiliate legal name (complete for a final request)', 284)
field('Affiliate notices', 'Affiliate contact / notices address', 217, 40, multiline=True)
section(c, 3, 'Execution of the final agreement', 187)
paragraph('Each party signs their own fields in the finalized DocuSeal request. Its signing dates and audit trail provide the execution record. This review copy does not collect signatures.', 165, 9.5)
for x, label in [(44, 'Affiliate signature'), (316, 'BEASTY authorized signature')]:
    c.setFillColor(INK); c.setFont(BOLD, 8.7)
    c.drawString(x, 99, label)
    c.setStrokeColor(RULE); c.setLineWidth(0.6)
    c.line(x, 75, x + 252, 75)
    c.setFont(BODY, 7.8); c.setFillColor(MUTED)
    c.drawString(x, 61, 'Date recorded by DocuSeal')
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
