import csv
from typing import List, IO
from .schemas import AWSAccountCreate


def parse_aws_account_csv(file: IO) -> List[AWSAccountCreate]:
    """
    Parse AWS Account Inventory CSV file and return list of AWSAccountCreate objects.
    
    Expected CSV format:
    #,AccountID,Account Alias(Friendly Name),BusinessUnit,Owner,Account Type(Data Type),Account Type(Function),Comments
    """
    accounts = []
    
    # Try different encodings
    raw_content = file.read()
    for encoding in ['utf-8', 'latin-1', 'cp1252']:
        try:
            content = raw_content.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
    else:
        # If all encodings fail, use utf-8 with error handling
        content = raw_content.decode('utf-8', errors='replace')
    
    lines = content.splitlines()
    
    reader = csv.DictReader(lines)
    
    for row in reader:
        # Skip empty rows
        if not row.get('AccountID'):
            continue
            
        account_id = str(row.get('AccountID', '')).strip()
        account_name = row.get('Account Alias(Friendly Name)', '').strip()
        
        # Skip rows without account ID or name
        if not account_id or not account_name:
            continue
        
        account = AWSAccountCreate(
            account_id=account_id,
            account_name=account_name,
            business_unit=row.get('BusinessUnit', '').strip() or None,
            owner=row.get('Owner', '').strip() or None,
            account_type_data=row.get('Account Type(Data Type)', '').strip() or None,
            account_type_function=row.get('Account Type(Function)', '').strip() or None,
            comments=row.get('Comments', '').strip() or None
        )
        accounts.append(account)
    
    return accounts
