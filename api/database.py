from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

def get_mysql_url():
    # Try to get SQLAlchemy style URL first
    url = os.getenv("DATABASE_URL")
    if url:
        return url
        
    # Fallback to parsing the ADO.NET style string from .env
    conn_str = os.getenv("ConnectionStrings__DefaultConnection")
    if not conn_str:
        # Fallback to local sqlite if nothing is configured
        return "sqlite:///./chats.db"
        
    # Parse "Server=localhost;Database=smarthireai;User=root;Password=Pt@sql0301;"
    parts = {part.split('=')[0].strip(): part.split('=')[1].strip() for part in conn_str.split(';') if '=' in part}
    
    user = parts.get('User', 'root')
    password = urllib.parse.quote_plus(parts.get('Password', ''))
    server = parts.get('Server', 'localhost')
    database = parts.get('Database', 'smarthireai')
    port = parts.get('Port', '3306')
    
    return f"mysql+pymysql://{user}:{password}@{server}:{port}/{database}"

SQLALCHEMY_DATABASE_URL = get_mysql_url()

if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
