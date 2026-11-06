from fastapi.security import OAuth2PasswordBearer
import jwt
from datetime import datetime, timedelta, timezone

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException,  Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from groq import Groq

from database import create_tables, get_db
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

create_tables()

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GROQ_API_KEY")
JWT_SECRET = os.getenv("JWT_SECRET")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        db = get_db()
        try:
            user = db.execute(
                "SELECT id, name, email FROM users WHERE id = ?",
                (int(user_id),)
            ).fetchone()
        finally:
            db.close()

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return dict(user)

    except (jwt.InvalidTokenError, ValueError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )
# Initialize Groq
client = Groq(api_key=API_KEY) if API_KEY else None

app = FastAPI(title="InfinityLoopX AI")

# Frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:63342",
        "http://127.0.0.1:63342",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def home():
    return {"message": "InfinityLoopX AI Backend is running!"}


@app.get("/health")
def health():
    return {
        "backend": "running",
        "api_key_configured": bool(API_KEY)
    }

@app.post("/chat")
def chat(
            request: ChatRequest,
            current_user: dict = Depends(get_current_user)
    ):

    if not client:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is missing from backend/.env"
        )

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are InfinityLoopX AI, a helpful and friendly "
                        "AI assistant. Reply clearly and helpfully."
                    )
                },
                {
                    "role": "user",
                    "content": request.message
                }
            ],
            temperature=0.7,
            max_tokens=1024
        )

        reply = completion.choices[0].message.content

        return {"reply": reply or "No response received."}

    except Exception as e:
        print("Groq API Error:", repr(e))
        raise HTTPException(
            status_code=502,
            detail=str(e)
        )

from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


@app.post("/signup")
def signup(request: SignupRequest):

    db = get_db()

    try:
        hashed_password = password_hash.hash(request.password)

        db.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (request.name, request.email.lower(), hashed_password)
        )

        db.commit()

        return {"message": "Account created successfully!"}

    except Exception as e:
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(status_code=409, detail="Email already registered")

        raise HTTPException(status_code=500, detail="Signup failed")

    finally:
        db.close()




class LoginRequest(BaseModel):
    email: EmailStr
    password: str

def create_access_token(user_id, email):
    if not JWT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="JWT_SECRET is missing"
        )

    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=2)
    }

    token = jwt.encode(
        payload,
        JWT_SECRET,
        algorithm="HS256"
    )

    return token

@app.post("/login")
def login(request: LoginRequest):

    db = get_db()

    try:
        user = db.execute(
            "SELECT * FROM users WHERE email = ?",
            (request.email.lower(),)
        ).fetchone()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        if not password_hash.verify(request.password, user["password"]):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        token = create_access_token(user["id"], user["email"])

        return {
            "message": "Login successful!",
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"]
            }
        }


    finally:
        db.close()
