"""Blank signing templates; no applicant data. Use the current IRS W-9 PDF.
DocuSeal tags and field positions are generated together. The agreement remains
DRAFT until BEASTY supplies its legal identity and approves the reward schedule.
"""
from pathlib import Path
from io import BytesIO
import json
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.utils import simpleSplit
from pypdf import PdfReader, PdfWriter

OUT = Path(__file__).resolve().parents[1] / 'out/affiliate-forms'
OUT.mkdir(parents=True, exist_ok=True)
W,H=612,792
records=[]

def tag(c,name,x,y,w,h,kind='text',role='Affiliate',required=True,extra=''):
    text='{{'+name+';type='+kind+';role='+role+';required='+str(required).lower()+f';width={w};height={h}'+extra+'}}'
    c.saveState(); c.setFillColor(white)
    c.setFont('Helvetica', min(6, w/max(1,len(text)*0.52)))
    c.drawString(x,y+h-6,text);c.restoreState()
    records.append({'name':name,'type':kind,'role':role,'required':required,'attributes':extra,'areas':[{'x':x/W,'y':(H-y-h)/H,'w':w/W,'h':h/H,'page':c.getPageNumber()}]})

def head(c,title,sub,draft=False):
    c.setFillColor(HexColor('#f1d600'));c.rect(0,H-18,W,18,fill=1,stroke=0)
    c.setFillColor(black);c.setFont('Helvetica-Bold',11);c.drawString(42,744,'BEASTY PAGES / AFFILIATE FORMS')
    c.setFont('Helvetica-Bold',23);c.drawString(42,703,title)
    para(c,sub,42,678,528,10)
    c.setFont('Helvetica',8);c.setFillColor(HexColor('#666666'))
    c.drawString(42,28,'DRAFT / FOR REVIEW / DO NOT SEND' if draft else 'Complete and sign through DocuSeal. Do not email completed forms.')
    c.setFillColor(black)

def para(c,text,x,y,w=528,size=10):
    c.setFont('Helvetica',size)
    for line in simpleSplit(text,'Helvetica',size,w):c.drawString(x,y,line);y-=size*1.5
    return y-10

def field(c,name,label,y,x=42,w=528,h=30,kind='text',role='Affiliate',required=True,extra=''):
    c.setFont('Helvetica-Bold',9);c.drawString(x,y+h+7,label)
    c.setStrokeColor(HexColor('#bcbcbc'));c.roundRect(x,y,w,h,3,stroke=1,fill=0)
    tag(c,name,x+5,y+3,w-10,h-6,kind,role,required,extra)

def finish(c,file):
    c.save();Path(str(file)+'.fields.json').write_text(json.dumps(records,indent=2));records.clear()

# W-9: retain all six IRS pages, original language and instructions.
source=OUT/'irs-w9.pdf'
r=PdfReader(source);buf=BytesIO();c=canvas.Canvas(buf,pagesize=(W,H))
tag(c,'Legal Name',58.6,659.967,517.4,14)
tag(c,'Business Name',58.6,635.966,517.4,14,required=False)
# One radio group prevents contradictory classifications.
for value,x,y in [('Individual/sole proprietor',73,603.719),('C corporation',180,603.719),('S corporation',252,603.719),('Partnership',324,603.719),('Trust/estate',388.8,603.719),('LLC',73,590.47),('Other',73,553.97)]:
    tag(c,'Federal Tax Classification',x,y,8,8,'radio',extra=';option='+value)
tag(c,'LLC Tax Classification',417.6,588.97,28.8,11,required=True,extra=';condition=Federal Tax Classification:LLC')
tag(c,'Other Tax Classification',162.4,551.97,284,12,required=True,extra=';condition=Federal Tax Classification:Other')
tag(c,'Foreign Partners',440.6,520.971,8,8,'checkbox',required=False)
tag(c,'Exempt Payee Code',543.6,587.97,32.4,12,required=False)
tag(c,'FATCA Exemption Code',500.6,551.97,75.4,12,required=False)
tag(c,'Street Address',58.6,491.966,329.45,14)
tag(c,'City State ZIP',58.6,467.968,329.45,14)
tag(c,'Requester Name and Address',389.8,467.968,186.2,38,required=False)
tag(c,'W9 Account References',58.6,443.967,517.4,14,required=False)
# Tax ID selection is on the cover page preceding the original IRS form.
# Conditional SSN/EIN fields each cover all printed boxes; validation in setup.
tag(c,'Social Security Number',417.6,395.968,158.4,24,required=True,extra=';condition=Tax ID Type:SSN')
tag(c,'Employer Identification Number',417.6,347.966,144,24,required=True,extra=';condition=Tax ID Type:EIN')
tag(c,'W9 Signature',120,193,255,19,'signature')
tag(c,'W9 Signing Date',417,193,159,19,'datenow')
c.save();buf.seek(0);r.pages[0].merge_page(PdfReader(buf).pages[0]);writer=PdfWriter()
for page in r.pages: writer.add_page(page)
# Empty widgets removed; DocuSeal fields are supplied by tags, so no duplicates.
writer.remove_annotations(subtypes='/Widget');writer.root_object.pop('/AcroForm',None)
cover=BytesIO();front=canvas.Canvas(cover,pagesize=(W,H))
head(front,'Tax information','Complete the attached IRS Form W-9 and retain its instructions. Use this packet only when Form W-9 applies to you.')
field(front,'Tax ID Type','Which taxpayer identification number will you enter?',536,kind='select',extra=';options=SSN,EIN')
para(front,'Choose SSN or EIN based on the IRS instructions. Enter the applicable number in Part I of the W-9 and leave the other number field blank. Enter the number for the taxpayer named on line 1. BEASTY reviews the completed form. For a pending TIN or a form that does not apply to you, contact glenn@beastypages.com before signing.',42,485)
para(front,'Do not send completed tax forms by ordinary email. Taxpayer numbers are entered on DocuSeal and are not saved in the BEASTY application database.',42,406)
front.save();cover.seek(0)
combined=PdfWriter();combined.append(PdfReader(cover))
for page in writer.pages: combined.add_page(page)
with (OUT/'beasty-w9.pdf').open('wb') as f:combined.write(f)
# Original W-9 fields are now on page 2; Tax ID Type remains on page 1.
for rec in records:
 if rec['name'] != 'Tax ID Type':
  for area in rec['areas']:area['page'] += 1
(OUT/'beasty-w9.pdf.fields.json').write_text(json.dumps(records,indent=2));records.clear()

p=OUT/'beasty-direct-deposit.pdf';c=canvas.Canvas(str(p),pagesize=(W,H))
head(c,'Direct deposit authorization','For affiliate commission payments. This authorizes credits to your account; it does not authorize debits.')
field(c,'Legal Name','Account holder / legal name',588)
field(c,'Bank Name','Bank or credit union',523)
field(c,'Routing Number','ABA routing number (9 digits)',458,w=252)
field(c,'Account Number','Account number',458,x=318,w=252)
field(c,'Account Type','Account type',393,kind='select',extra=';options=Checking,Savings')
field(c,'Bank Proof','Voided check or bank letter (optional)',308,h=52,kind='file',required=False)
y=para(c,'I certify that I own or am authorized to receive payments in this account. I authorize BEASTY to pay amounts owed to me by direct deposit. I will notify glenn@beastypages.com of changes using a secure replacement form. This authorization continues until I revoke it in writing; allow a reasonable processing period. Never upload a check with a live payment instruction.',42,274)
field(c,'Deposit Signature','Affiliate signature',110,w=340,kind='signature')
field(c,'Deposit Signing Date','Signing date',110,x=402,w=168,kind='datenow');finish(c,p)

p=OUT/'beasty-id-verification.pdf';c=canvas.Canvas(str(p),pagesize=(W,H))
head(c,'Identity document','For BEASTY to verify who receives affiliate payments. Upload directly to DocuSeal; do not send ID by ordinary email.')
field(c,'Legal Name','Legal name',579)
field(c,'ID Type','Document type',514,kind='select',extra=";options=Driver's license,State ID,Passport")
field(c,'ID Photo','Clear photo of current ID (front or passport identity page)',240,h=225,kind='image')
field(c,'ID Reverse','Reverse of ID (only if requested by BEASTY)',139,h=58,kind='image',required=False)
para(c,'Use a legible image showing the relevant identity details. BEASTY will review it; uploading a photo does not automatically verify your identity. Contact glenn@beastypages.com about correcting or replacing this document.',42,109,528,9);finish(c,p)

# Draft agreement: economic and legal setup values are explicitly unresolved.
p=OUT/'beasty-affiliate-agreement-DRAFT.pdf';c=canvas.Canvas(str(p),pagesize=(W,H))
head(c,'Affiliate agreement','Draft for Glenn and Leon to review. Replace every [CONFIRM] item before using this agreement.',True)
y=640
sections=[
('1. Parties and purpose','This agreement is between [CONFIRM: BEASTY legal entity and mailing address], doing business as BEASTY Pages (BEASTY), and the affiliate identified below. The affiliate may promote BEASTY and refer users and businesses. It becomes effective only when both parties sign.'),
('2. Independent relationship','The affiliate controls their own promotional work and expenses. They may not bind BEASTY, collect money for BEASTY, or make promises that BEASTY has not authorized. The parties intend an independent contractor relationship; any legally required classification controls.'),
('3. Referral rewards and payment','Only eligible, recorded referrals earn the rewards set out in Schedule A. BEASTY provides a statement showing eligible referrals, adjustments and amounts payable. The affiliate supplies accurate tax and payout information. Schedule A must state the payment date, qualification rules and treatment of cancellations.'),
('4. Promotion and disclosures','Promotions must be truthful, comply with applicable laws and clearly disclose the affiliate relationship when recommending BEASTY. Use approved brand assets and current offers. Do not send unsolicited messages, misrepresent earnings, purchase fake referrals or use another person’s identity.'),
('5. Information and privacy','The affiliate provides their W-9, bank details and ID directly through DocuSeal. BEASTY uses these documents for onboarding, payment and applicable tax reporting and limits access to authorized personnel. Contact glenn@beastypages.com for corrections or secure replacement forms. [CONFIRM: retention period and privacy notice].'),
('6. Ending the relationship','Either party may end participation by written notice to the other. BEASTY may suspend participation while reviewing suspected fraud or misuse. Amounts already validly earned remain payable under Schedule A, subject to its documented refund and dispute rules. Stop using BEASTY brand assets when participation ends.'),
('7. Entire agreement','This agreement and completed Schedule A state the parties’ arrangement. Future changes require notice and agreement before they affect future referrals. [CONFIRM: governing law, venue and any required notice period]. No party signs on the other’s behalf.')]
for title,text in sections:
 c.setFont('Helvetica-Bold',10);c.drawString(42,y,title);y=para(c,text,42,y-17,528,9.5)-4
c.showPage();head(c,'Schedule A & signatures','DRAFT. BEASTY must confirm the commercial terms and legal entity before an affiliate signs.',True)
y=633
for title,text in [
('Published BARK reference (confirm for this agreement)','The project notes and Careers page describe 3 points per referred user, 6 per referred business, $1 per point and redemption from 100 points. These reference figures are not sufficient to define an eligible referral or the payment date. Glenn must confirm whether this agreement uses these figures or a separate commission schedule.'),
('Required final terms','[CONFIRM: reward amount or rate for each qualifying user and business; whether one-time or recurring; qualifying purchase or activation; attribution window and conflict rules; treatment of refunds and chargebacks; minimum redemption; payout frequency and deadline; final payment on termination; lawful taxes and deductions].'),
('Excluded until expressly agreed','No promotional multiplier, goal bonus, guaranteed earnings, automated payout, exclusivity, arbitration, indemnity or broad liability waiver is added by this draft.')]:
 c.setFont('Helvetica-Bold',10);c.drawString(42,y,title);y=para(c,text,42,y-17,528,10)-8
field(c,'Legal Name','Affiliate legal name',308)
field(c,'Affiliate Signature','Affiliate signature',236,w=340,kind='signature')
field(c,'Affiliate Signing Date','Signing date',236,x=402,w=168,kind='datenow')
field(c,'BEASTY Representative','BEASTY authorized representative',161,role='BEASTY')
field(c,'BEASTY Signature','BEASTY countersignature',88,w=340,kind='signature',role='BEASTY')
field(c,'BEASTY Signing Date','Countersigning date',88,x=402,w=168,kind='datenow',role='BEASTY');finish(c,p)

writer=PdfWriter()
for name in ['beasty-w9.pdf','beasty-direct-deposit.pdf','beasty-id-verification.pdf','beasty-affiliate-agreement-DRAFT.pdf']:
 writer.append(OUT/name)
with (OUT/'beasty-affiliate-packet-DRAFT.pdf').open('wb') as f:writer.write(f)
print('Created 4 templates plus a 11-page draft packet in',OUT)

# Also make the combined upload an actual AcroForm. The Web UI imports these
# exact names/types/positions instead of guessing fields from page images.
from pypdf.generic import DictionaryObject, NameObject, TextStringObject, NumberObject, ArrayObject, BooleanObject, FloatObject, DecodedStreamObject
forms=[];offset=0
for name in ['beasty-w9.pdf','beasty-direct-deposit.pdf','beasty-id-verification.pdf','beasty-affiliate-agreement-DRAFT.pdf']:
 for rec in json.loads((OUT/(name+'.fields.json')).read_text()):
  for area in rec['areas']:
   area['page'] += offset
  forms.append(rec)
 offset += len(PdfReader(OUT/name).pages)
writer=PdfWriter();writer.append(OUT/'beasty-affiliate-packet-DRAFT.pdf')
fields=ArrayObject(); by_name={}
for rec in forms:
 name=rec['name']; kind=rec['type']
 if name not in by_name:
  field_type='/Sig' if kind=='signature' else '/Btn' if kind in ['radio','checkbox'] else '/Ch' if kind=='select' else '/Tx'
  obj=DictionaryObject({NameObject('/T'):TextStringObject(name),NameObject('/FT'):NameObject(field_type),NameObject('/Ff'):NumberObject(2 if rec['required'] and name not in ['Social Security Number','Employer Identification Number','LLC Tax Classification','Other Tax Classification'] else 0),NameObject('/Kids'):ArrayObject()})
  if kind=='radio':obj[NameObject('/Ff')]=NumberObject(32768+2)
  if kind=='select':
   values={'Tax ID Type':['SSN','EIN'],'Account Type':['Checking','Savings'],'ID Type':["Driver's license",'State ID','Passport']}[name]
   obj[NameObject('/Opt')]=ArrayObject([TextStringObject('Choose'),*[TextStringObject(v) for v in values]])
   obj[NameObject('/Ff')]=NumberObject(131072+(2 if rec['required'] else 0))
  if kind=='datenow':
   obj[NameObject('/AA')]=DictionaryObject({NameObject('/F'):DictionaryObject({NameObject('/S'):NameObject('/JavaScript'),NameObject('/JS'):TextStringObject('AFDate_FormatEx("mm/dd/yyyy");')})})
  ref=writer._add_object(obj);fields.append(ref);by_name[name]=ref
 for area in rec['areas']:
  page=writer.pages[area['page']-1];x=area['x']*W;y=H-(area['y']+area['h'])*H
  widget=DictionaryObject({NameObject('/Type'):NameObject('/Annot'),NameObject('/Subtype'):NameObject('/Widget'),NameObject('/Rect'):ArrayObject([FloatObject(x),FloatObject(y),FloatObject(x+area['w']*W),FloatObject(y+area['h']*H)]),NameObject('/Parent'):by_name[name],NameObject('/P'):page.indirect_reference,NameObject('/F'):NumberObject(4)})
  if kind in ['radio','checkbox']:
   blank=DecodedStreamObject();blank.set_data(b'')
   blank.update({NameObject('/Type'):NameObject('/XObject'),NameObject('/Subtype'):NameObject('/Form'),NameObject('/BBox'):ArrayObject([NumberObject(0),NumberObject(0),FloatObject(area['w']*W),FloatObject(area['h']*H)]),NameObject('/Resources'):DictionaryObject()})
   appearance=writer._add_object(blank)
   option=rec.get('attributes','').split(';option=')[-1] if ';option=' in rec.get('attributes','') else 'Yes'
   widget[NameObject('/AS')]=NameObject('/Off')
   widget[NameObject('/AP')]=DictionaryObject({NameObject('/N'):DictionaryObject({NameObject('/Off'):appearance,NameObject('/'+option):appearance})})
  widget_ref=writer._add_object(widget);by_name[name].get_object()['/Kids'].append(widget_ref)
  if '/Annots' not in page:page[NameObject('/Annots')]=ArrayObject()
  page['/Annots'].append(widget_ref)
writer.root_object[NameObject('/AcroForm')]=DictionaryObject({NameObject('/Fields'):fields,NameObject('/NeedAppearances'):BooleanObject(True),NameObject('/DA'):TextStringObject('/Helv 10 Tf 0 g')})
with (OUT/'BEASTY-Affiliate-Packet-DRAFT.pdf').open('wb') as f:writer.write(f)
(OUT/'packet-fields.json').write_text(json.dumps(forms,indent=2))
check=PdfReader(OUT/'BEASTY-Affiliate-Packet-DRAFT.pdf');assert set(check.get_fields())==set(by_name)
assert len(check.pages)==11
print('Verified',len(by_name),'canonical fields in the native DocuSeal upload')
