import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / "key.env")
# print("SECRET_KEY exists:", "SECRET_KEY" in os.environ)
# print("Loaded value:", bool(os.getenv("SECRET_KEY")))

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 20

# print("Key loaded:", bool(SECRET_KEY))

    