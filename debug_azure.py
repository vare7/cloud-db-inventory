import sys, io, csv
sys.path.append('backend')
from app.csv_parser import parse_csv_with_report
raw=open('backend/tests/data/sample_azure.csv','r',encoding='utf-8').read()
print('First 10 chars repr:', [c for c in raw[:10]])
reader=csv.reader(io.StringIO(raw))
headers=next(reader)
print('Raw headers:', headers)
reader_dict=csv.DictReader(io.StringIO(raw))
row=next(reader_dict)
print('Original dict keys:', list(row.keys()))
# Apply normalization identical to parser
normalized_row={}
for k,v in row.items():
    if k is None: continue
    key_clean=k.strip()
    if key_clean.startswith('\ufeff'):
        key_clean=key_clean.replace('\ufeff','',1)
    key_norm=key_clean.lower()
    normalized_row[key_norm]=(v.strip() if v and str(v).strip() else '')
print('Normalized keys:', list(normalized_row.keys()))
print('Normalized name:', normalized_row.get('name'))
print('Normalized db_type:', normalized_row.get('db_type'))
print('Normalized location:', normalized_row.get('location'))
rec, skipped = parse_csv_with_report(raw, provider='Azure')
print('Parser records:', len(rec), 'skipped:', skipped)
