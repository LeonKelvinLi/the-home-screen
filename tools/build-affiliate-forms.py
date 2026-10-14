"""Blank signing templates; no applicant data. Use the current IRS W-9 PDF.
DocuSeal tags and field positions are generated together. The agreement remains
DRAFT until BEASTY supplies its legal identity and approves the reward schedule.
"""
from pathlib import Path
from io import BytesIO
import json
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter
from affiliate_form_design import header, section, paragraph, INK, RULE, FIELD, BOLD
from affiliate_disclosures import draw_disclosures

OUT = Path(__file__).resolve().parents[1] / 'out/affiliate-forms'
OUT.mkdir(parents=True, exist_ok=True)
OUTPUT_PDF=OUT.parents[1]/'output/pdf'
OUTPUT_PDF.mkdir(parents=True,exist_ok=True)
W,H=612,792
records=[]

def tag(c,name,x,y,w,h,kind='text',role='Affiliate',required=True,extra=''):
    text='{{'+name+';type='+kind+';role='+role+';required='+str(required).lower()+f';width={w};height={h}'+extra+'}}'
    c.saveState()
    marker=c.beginText(x,y+h-6)
    marker.setFont('Helvetica', min(6, w/max(1,len(text)*0.52)))
    marker.setTextRenderMode(3)
    marker.textOut(text);c.drawText(marker);c.restoreState()
    records.append({'name':name,'type':kind,'role':role,'required':required,'attributes':extra,'areas':[{'x':x/W,'y':(H-y-h)/H,'w':w/W,'h':h/H,'page':c.getPageNumber()}]})

def head(c,title,sub,draft=False,page=1):
    header(c,title,sub,draft=draft,page=page,total=13,category='Affiliate onboarding / form packet')

def para(c,text,x,y,w=524,size=10):
    return paragraph(c,text,x,y,w,size,leading=size*1.38)-10

def field(c,name,label,y,x=44,w=524,h=30,kind='text',role='Affiliate',required=True,extra=''):
    c.setFillColor(INK);c.setFont(BOLD,8.7);c.drawString(x,y+h+7,label)
    c.setStrokeColor(RULE);c.setFillColor(FIELD);c.setLineWidth(0.6)
    c.rect(x,y,w,h,stroke=1,fill=1)
    tag(c,name,x+5,y+3,w-10,h-6,kind,role,required,extra)

def finish(c,file):
    c.save();Path(str(file)+'.fields.json').write_text(json.dumps(records,indent=2));records.clear()

# W-9: retain all six IRS pages, original language and instructions.
source=OUT/'irs-w9.pdf'
r=PdfReader(source);buf=BytesIO();c=canvas.Canvas(buf,pagesize=(W,H))
tag(c,'Taxpayer Legal Name',58.6,659.967,517.4,14)
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
section(front,1,'Taxpayer identification',617)
field(front,'Tax ID Type','Which taxpayer identification number will you enter?',551,kind='select',extra=';options=SSN,EIN')
para(front,'Choose SSN or EIN based on the IRS instructions. Enter the applicable number in Part I of the W-9 and leave the other number field blank. Enter the number for the taxpayer named on line 1. BEASTY reviews the completed form. For a pending TIN or a form that does not apply to you, contact glenn@beastypages.com before signing.',44,517)
section(front,2,'Complete the official form',400)
para(front,'The next six pages contain the IRS Form W-9 and its original instructions. Complete the applicable fields and sign the certification in DocuSeal. Keep the instructions with your copy.',44,376)
section(front,3,'Keep your information secure',292)
para(front,'Do not send completed tax forms by ordinary email. Taxpayer numbers are entered on DocuSeal and are not saved in the BEASTY application database.',44,268)
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
head(c,'Direct deposit authorization','For affiliate commission payments. This authorizes credits to your account; it does not authorize debits.',page=8)
section(c,1,'Account details',617)
field(c,'Account Holder Name','Account holder / legal name',560)
field(c,'Bank Name','Bank or credit union',505)
field(c,'Routing Number','ABA routing number (9 digits)',450,w=252)
field(c,'Account Number','Account number',450,x=316,w=252)
field(c,'Account Type','Account type',395,kind='select',extra=';options=Checking,Savings')
section(c,2,'Supporting document',366)
field(c,'Bank Proof','Voided check or bank letter (optional)',280,h=56,kind='file',required=False)
section(c,3,'Authorization',253)
y=para(c,'I certify that I own or am authorized to receive payments in this account. I authorize BEASTY to pay amounts owed to me by direct deposit. I will notify glenn@beastypages.com of changes using a secure replacement form. This authorization continues until I revoke it in writing; allow a reasonable processing period. Never upload a check with a live payment instruction.',44,230,size=9.6)
assert y>120, f'Deposit authorization overlaps signatures: {y}'
field(c,'Deposit Signature','Affiliate signature',100,w=328,kind='signature')
field(c,'Deposit Signing Date','Signing date',100,x=388,w=180,kind='datenow');finish(c,p)

p=OUT/'beasty-id-verification.pdf';c=canvas.Canvas(str(p),pagesize=(W,H))
head(c,'Identity document','For BEASTY to verify who receives affiliate payments. Upload directly to DocuSeal; do not send ID by ordinary email.',page=9)
section(c,1,'Identity details',617)
field(c,'ID Legal Name','Your legal name as shown on the ID',560)
field(c,'ID Type','Document type',505,kind='select',extra=";options=Driver's license,State ID,Passport")
section(c,2,'Document upload',467)
field(c,'ID Photo','Clear photo of current ID (front or passport identity page)',225,h=214,kind='image')
field(c,'ID Reverse','Reverse of ID (only if requested by BEASTY)',130,h=50,kind='image',required=False)
para(c,'Use a legible image showing the relevant identity details. BEASTY will review it; uploading a photo does not automatically verify your identity. Contact glenn@beastypages.com about correcting or replacing this document.',44,104,524,9);finish(c,p)

p=OUT/'beasty-affiliate-disclosures-DRAFT.pdf';c=canvas.Canvas(str(p),pagesize=(W,H))
c.setTitle('BEASTY affiliate disclosures - review draft');c.setAuthor('BEASTY Pages')
draw_disclosures(c,start_page=10,total=13,category='Affiliate onboarding / form packet');finish(c,p)
standalone=canvas.Canvas(str(OUTPUT_PDF/'BEASTY-Affiliate-Disclosures-DRAFT.pdf'),pagesize=(W,H))
standalone.setTitle('BEASTY affiliate disclosures - review draft');standalone.setAuthor('BEASTY Pages')
draw_disclosures(standalone);standalone.save()

# Draft agreement: economic and legal setup values are explicitly unresolved.
p=OUT/'beasty-affiliate-agreement-DRAFT.pdf';c=canvas.Canvas(str(p),pagesize=(W,H))
head(c,'Affiliate agreement','Draft for Glenn and Leon to review. BEASTY completes company and payment terms before an applicant receives it.',True,page=12)
y=617
sections=[
('1. Parties and purpose','This agreement is between [CONFIRM: BEASTY legal entity and mailing address], doing business as BEASTY Pages (BEASTY), and the affiliate identified below. The affiliate may promote BEASTY and refer users and businesses. It becomes effective only when both parties sign.'),
('2. Independent relationship','The affiliate controls their own promotional work and expenses. They may not bind BEASTY, collect money for BEASTY, or make promises that BEASTY has not authorized. The parties intend an independent contractor relationship; any legally required classification controls.'),
('3. Referral rewards and payment','Only eligible, recorded referrals earn the rewards set out in Schedule A. BEASTY provides a statement showing eligible referrals, adjustments and amounts payable. The affiliate supplies accurate tax and payout information. Schedule A must state the payment date, qualification rules and treatment of cancellations.'),
('4. Promotion and disclosures','Promotions must be truthful, comply with applicable laws and clearly disclose the affiliate relationship when recommending BEASTY. Use approved brand assets and current offers. Do not send unsolicited messages, misrepresent earnings, purchase fake referrals or use another person’s identity.'),
('5. Information and disclosures','The affiliate provides their W-9, bank details and ID directly through DocuSeal. The written disclosures in this packet explain electronic signing, document handling, direct deposit and affiliate promotion and form part of this agreement. Contact glenn@beastypages.com for corrections or secure replacement forms. [CONFIRM: BEASTY privacy and retention policy].'),
('6. Ending the relationship','Either party may end participation by written notice to the other. BEASTY may suspend participation while reviewing suspected fraud or misuse. Amounts already validly earned remain payable under Schedule A, subject to its documented refund and dispute rules. Stop using BEASTY brand assets when participation ends.'),
('7. Entire agreement','This agreement and completed Schedule A state the parties’ arrangement. Future changes require notice and agreement before they affect future referrals. [CONFIRM: governing law, venue and any required notice period]. Each signer signs only for the party they are authorized to represent.')]
for title,text in sections:
 number,label=title.split('. ',1)
 section(c,int(number),label,y);y=paragraph(c,text,44,y-20,524,9.6,leading=13.2)-7
assert y>55, f'Agreement text overflows: {y}'
c.showPage();head(c,'Schedule A & signatures','BEASTY completes this schedule before sending the finalized agreement. Applicants review the terms and sign.',True,page=13)
y=617
for number,(title,text) in enumerate([
('Published BARK reference (confirm for this agreement)','The project notes and Careers page describe 3 points per referred user, 6 per referred business, $1 per point and redemption from 100 points. These reference figures are not sufficient to define an eligible referral or the payment date. Glenn must confirm whether this agreement uses these figures or a separate commission schedule.'),
('Required final terms','[CONFIRM: reward amount or rate for each qualifying user and business; whether one-time or recurring; qualifying purchase or activation; attribution window and conflict rules; treatment of refunds and chargebacks; minimum redemption; payout frequency and deadline; final payment on termination; lawful taxes and deductions].'),
('Excluded until expressly agreed','No promotional multiplier, goal bonus, guaranteed earnings, automated payout, exclusivity, arbitration, indemnity or broad liability waiver is added by this draft.')],1):
 section(c,number,title,y);y=paragraph(c,text,44,y-20,524,9.5,leading=13.1)-9
assert y>350, f'Schedule A overlaps signing fields: {y}'
section(c,4,'Affiliate',338)
field(c,'Affiliate Legal Name','Affiliate legal name (individual or business)',286)
field(c,'Affiliate Signature','Affiliate signature',217,w=328,kind='signature')
field(c,'Affiliate Signing Date','Signing date',217,x=388,w=180,kind='datenow')
section(c,5,'BEASTY countersignature',184)
field(c,'BEASTY Representative','BEASTY authorized representative',129,role='BEASTY')
field(c,'BEASTY Signature','BEASTY countersignature',66,w=328,kind='signature',role='BEASTY')
field(c,'BEASTY Signing Date','Countersigning date',66,x=388,w=180,kind='datenow',role='BEASTY');finish(c,p)

writer=PdfWriter()
for name in ['beasty-w9.pdf','beasty-direct-deposit.pdf','beasty-id-verification.pdf','beasty-affiliate-disclosures-DRAFT.pdf','beasty-affiliate-agreement-DRAFT.pdf']:
 writer.append(OUT/name)
with (OUT/'beasty-affiliate-packet-DRAFT.pdf').open('wb') as f:writer.write(f)
print('Created 5 templates plus a 13-page draft packet in',OUT)

# Also make the combined upload an actual AcroForm. The Web UI imports these
# exact names/types/positions instead of guessing fields from page images.
from pypdf.generic import DictionaryObject, NameObject, TextStringObject, NumberObject, ArrayObject, BooleanObject, FloatObject, DecodedStreamObject
forms=[];offset=0
for name in ['beasty-w9.pdf','beasty-direct-deposit.pdf','beasty-id-verification.pdf','beasty-affiliate-disclosures-DRAFT.pdf','beasty-affiliate-agreement-DRAFT.pdf']:
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
   selected=DecodedStreamObject()
   width,height=area['w']*W,area['h']*H
   selected.set_data(f'0.12 0.15 0.17 RG 1 w 1.5 1.5 m {width-1.5:.2f} {height-1.5:.2f} l S 1.5 {height-1.5:.2f} m {width-1.5:.2f} 1.5 l S'.encode())
   selected.update({key:value for key,value in blank.items()})
   option=rec.get('attributes','').split(';option=')[-1] if ';option=' in rec.get('attributes','') else 'Yes'
   widget[NameObject('/AS')]=NameObject('/Off')
   widget[NameObject('/AP')]=DictionaryObject({NameObject('/N'):DictionaryObject({NameObject('/Off'):appearance,NameObject('/'+option):writer._add_object(selected)})})
  widget_ref=writer._add_object(widget);by_name[name].get_object()['/Kids'].append(widget_ref)
  if '/Annots' not in page:page[NameObject('/Annots')]=ArrayObject()
  page['/Annots'].append(widget_ref)
helvetica=writer._add_object(DictionaryObject({NameObject('/Type'):NameObject('/Font'),NameObject('/Subtype'):NameObject('/Type1'),NameObject('/BaseFont'):NameObject('/Helvetica')}))
writer.root_object[NameObject('/AcroForm')]=DictionaryObject({NameObject('/Fields'):fields,NameObject('/NeedAppearances'):BooleanObject(False),NameObject('/DA'):TextStringObject('/Helv 10 Tf 0 g'),NameObject('/DR'):DictionaryObject({NameObject('/Font'):DictionaryObject({NameObject('/Helv'):helvetica})})})
blank_values={name:'' for name,ref in by_name.items() if ref.get_object()['/FT'] in ['/Tx','/Ch']}
writer.update_page_form_field_values(None,blank_values,auto_regenerate=False)
writer.update_page_form_field_values(None,{'BEASTY Representative':'Glenn Malicdem'},auto_regenerate=False)
with (OUT/'BEASTY-Affiliate-Packet-DRAFT.pdf').open('wb') as f:writer.write(f)
(OUT/'packet-fields.json').write_text(json.dumps(forms,indent=2))
check=PdfReader(OUT/'BEASTY-Affiliate-Packet-DRAFT.pdf');assert set(check.get_fields())==set(by_name)
assert len(check.pages)==13
assert len(by_name)==35
widgets=[a.get_object() for page in check.pages for a in page.get('/Annots',[]) if a.get_object().get('/Subtype')=='/Widget']
assert all(widget.get('/AP',{}).get('/N') for widget in widgets if widget['/Parent'].get_object()['/FT']!='/Sig')
probe=PdfWriter();probe.clone_document_from_reader(check)
values={'Taxpayer Legal Name':'TEST TAXPAYER - QA ONLY','Account Holder Name':'TEST ACCOUNT HOLDER - QA ONLY','ID Legal Name':'TEST PERSON - QA ONLY','Affiliate Legal Name':'TEST AFFILIATE - QA ONLY','Bank Name':'TEST BANK - QA ONLY','Tax ID Type':'SSN','Federal Tax Classification':'/C corporation'}
probe.update_page_form_field_values(None,values,auto_regenerate=False)
with (OUT/'packet-fill-test.pdf').open('wb') as stream:probe.write(stream)
filled=PdfReader(OUT/'packet-fill-test.pdf')
for name,value in values.items():assert filled.get_fields()[name]['/V']==value
classifications=[a.get_object() for page in filled.pages for a in page.get('/Annots',[]) if a.get_object().get('/Subtype')=='/Widget' and a.get_object()['/Parent'].get_object()['/T']=='Federal Tax Classification']
assert sum(w['/AS']=='/C corporation' for w in classifications)==1
selected_classification=next(w for w in classifications if w['/AS']=='/C corporation')
assert selected_classification['/AP']['/N']['/C corporation'].get_object().get_data(), 'Selected tax classification must be visible'
for widget in [a.get_object() for page in filled.pages for a in page.get('/Annots',[]) if a.get_object().get('/Subtype')=='/Widget']:
 parent=widget['/Parent'].get_object()
 if parent['/T'] in values and parent['/FT']!='/Btn':
  assert parent['/V']==values[parent['/T']]
  assert widget['/AP']['/N'].get_object().get_data()
deliverable=OUT.parents[1]/'output/pdf/BEASTY-Affiliate-Packet-Professional-DRAFT.pdf'
deliverable.parent.mkdir(parents=True,exist_ok=True)
deliverable.write_bytes((OUT/'BEASTY-Affiliate-Packet-DRAFT.pdf').read_bytes())
print('Verified',len(by_name),'canonical fields in the native DocuSeal upload')
