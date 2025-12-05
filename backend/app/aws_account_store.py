from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict
from .aws_account_models import AWSAccountModel
from .schemas import AWSAccountCreate


class AWSAccountStore:
    def __init__(self, db: Session):
        self.db = db

    def create(self, account: AWSAccountCreate) -> AWSAccountModel:
        """Create a new AWS account record"""
        db_account = AWSAccountModel(**account.model_dump())
        self.db.add(db_account)
        self.db.commit()
        self.db.refresh(db_account)
        return db_account

    def bulk_create(self, accounts: List[AWSAccountCreate]) -> int:
        """Bulk create AWS account records"""
        db_accounts = [AWSAccountModel(**account.model_dump()) for account in accounts]
        self.db.bulk_save_objects(db_accounts)
        self.db.commit()
        return len(db_accounts)

    def upsert(self, account: AWSAccountCreate) -> AWSAccountModel:
        """Create or update an AWS account record"""
        existing = self.db.query(AWSAccountModel).filter(
            AWSAccountModel.account_id == account.account_id
        ).first()
        
        if existing:
            for key, value in account.model_dump().items():
                setattr(existing, key, value)
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            return self.create(account)

    def bulk_upsert(self, accounts: List[AWSAccountCreate]) -> int:
        """Bulk upsert AWS account records"""
        count = 0
        for account in accounts:
            self.upsert(account)
            count += 1
        return count

    def get_by_account_id(self, account_id: str) -> Optional[AWSAccountModel]:
        """Get an AWS account by account ID"""
        return self.db.query(AWSAccountModel).filter(
            AWSAccountModel.account_id == account_id
        ).first()

    def list_all(self) -> List[AWSAccountModel]:
        """List all AWS accounts"""
        return self.db.query(AWSAccountModel).all()

    def get_account_names_map(self) -> Dict[str, str]:
        """Get a mapping of account_id -> account_name"""
        accounts = self.db.query(
            AWSAccountModel.account_id, 
            AWSAccountModel.account_name
        ).all()
        return {account.account_id: account.account_name for account in accounts}

    def delete(self, account_id: str) -> bool:
        """Delete an AWS account record"""
        account = self.get_by_account_id(account_id)
        if account:
            self.db.delete(account)
            self.db.commit()
            return True
        return False
