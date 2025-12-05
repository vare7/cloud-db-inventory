from sqlalchemy import Column, String
from .database import Base


class AWSAccountModel(Base):
    __tablename__ = "aws_accounts"

    account_id = Column(String, primary_key=True)
    account_name = Column(String, nullable=False)
    business_unit = Column(String, nullable=True)
    owner = Column(String, nullable=True)
    account_type_data = Column(String, nullable=True)
    account_type_function = Column(String, nullable=True)
    comments = Column(String, nullable=True)
