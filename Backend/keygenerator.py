# import secrets
# from dotenv import load_dotenv
# import os
# from pathlib import Path

# BASE_DIR = Path(__file__).resolve().parent
# env_path = BASE_DIR / "key.env"

# with open(env_path,'w') as k:
#     k.write("SECRET_KEY=" + secrets.token_urlsafe(32))
#     print("Done")
    
# load_dotenv("key.env")
# SECRET_KEY = os.getenv("SECRET_KEY")
# print(bool(SECRET_KEY))
