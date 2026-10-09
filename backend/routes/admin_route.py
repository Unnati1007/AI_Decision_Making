from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/admin", tags=["admin"])

import sqlite3
import json
import bcrypt
from pathlib import Path

# Password Security Helpers
def hash_password(password: str) -> str:
    if not password:
        return ""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def is_hashed(pw: str) -> bool:
    if not pw:
        return False
    return pw.startswith("$2b$") or pw.startswith("$2a$") or pw.startswith("$2y$")

# Database Setup
DB_PATH = Path("admin_system.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        password TEXT,
        role TEXT,
        domain TEXT,
        queryCount INTEGER DEFAULT 0,
        joined TEXT,
        status TEXT
    )''')
    conn.execute('''CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user TEXT,
        action TEXT,
        timestamp TEXT,
        severity TEXT
    )''')
    
    # Check if users exist, if not add seed with hashed passwords
    res_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()
    if res_users[0] == 0:
        conn.execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
                    ("admin-1", "System Admin", "admin@intellichoice.ai", hash_password("admin123"), "admin", "System", 0, "2026-04-20", "Active"))
        conn.execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
                    ("user-1", "Demo User", "user@intellichoice.ai", hash_password("user123"), "user", "Career", 14, "2026-04-22", "Active"))
        conn.execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
                    ("user-2", "Finance Pro", "finance@demo.ai", hash_password("demo123"), "user", "Finance", 8, "2026-04-23", "Active"))

    # Migrate existing plaintext passwords to hashed
    existing_users = conn.execute("SELECT id, password FROM users").fetchall()
    for u in existing_users:
        uid, pw = u["id"], u["password"]
        if pw and not is_hashed(pw):
            conn.execute("UPDATE users SET password = ? WHERE id = ?", (hash_password(pw), uid))

    # Force seed logs if few exist
    res_logs = conn.execute("SELECT COUNT(*) FROM audit_logs").fetchone()
    if res_logs[0] < 5:
        past_logs = [
            ("L1", "user@intellichoice.ai", "Generated AI recommendation (Career)", "2026-04-20 10:15:00", "Low"),
            ("L2", "user@intellichoice.ai", "Generated AI recommendation (Career)", "2026-04-20 14:30:00", "Low"),
            ("L3", "finance@demo.ai", "Generated AI recommendation (Finance)", "2026-04-21 09:20:00", "Low"),
            ("L4", "user@intellichoice.ai", "Generated AI recommendation (Wellbeing)", "2026-04-21 16:45:00", "Low"),
            ("L5", "admin@intellichoice.ai", "Security sweep completed", "2026-04-22 08:00:00", "Low"),
            ("L6", "finance@demo.ai", "Generated AI recommendation (Finance)", "2026-04-22 11:30:00", "Low"),
            ("L7", "user@intellichoice.ai", "Generated AI recommendation (Career)", "2026-04-23 09:00:00", "Low"),
            ("L8", "user@intellichoice.ai", "Failed login attempt", "2026-04-23 10:15:00", "Medium"),
            ("L9", "finance@demo.ai", "Generated AI recommendation (Legal)", "2026-04-23 11:00:00", "Low"),
        ]
        conn.executemany("INSERT OR IGNORE INTO audit_logs VALUES (?, ?, ?, ?, ?)", past_logs)
    
    conn.commit()
    conn.close()

init_db()

class UserCreate(BaseModel):
    id: str
    name: str
    email: str
    password: str
    role: str
    domain: Optional[str] = None
    queryCount: int = 0
    joined: str
    status: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None
    domain: Optional[str] = None
    queryCount: Optional[int] = None
    password: Optional[str] = None

@router.get("/users")
def get_users():
    conn = get_db_connection()
    users = [dict(row) for row in conn.execute("SELECT * FROM users").fetchall()]
    conn.close()
    for u in users:
        u.pop("password", None)
    return users

@router.post("/users/login")
def login_user(creds: UserLogin):
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE LOWER(email) = ?", (creds.email.lower(),)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password. Please try again.")
    user_dict = dict(user)
    if not verify_password(creds.password, user_dict.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password. Please try again.")
    if user_dict.get("status") == "Blocked":
        raise HTTPException(status_code=403, detail="Your account has been blocked by the administrator.")
    
    user_dict.pop("password", None)
    return user_dict

@router.post("/users/register")
def register_user(user: UserCreate):
    conn = get_db_connection()
    hashed_pw = hash_password(user.password) if user.password else ""
    try:
        conn.execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
                    (user.id, user.name, user.email, hashed_pw, user.role, user.domain, user.queryCount, user.joined, user.status))
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="User already exists")
    finally:
        conn.close()
    res = user.dict()
    res.pop("password", None)
    return res

@router.post("/users/{user_id}/update")
def update_user(user_id: str, data: UserUpdate):
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = data.dict(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        update_data["password"] = hash_password(update_data["password"])
        
    if update_data:
        fields = ", ".join([f"{k} = ?" for k in update_data.keys()])
        values = list(update_data.values()) + [user_id]
        conn.execute(f"UPDATE users SET {fields} WHERE id = ?", values)
        conn.commit()
    
    updated = dict(conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone())
    conn.close()
    updated.pop("password", None)
    return updated

@router.get("/stats")
def get_stats():
    conn = get_db_connection()
    # Base data from DB
    actual_queries = conn.execute("SELECT SUM(queryCount) FROM users").fetchone()[0] or 0
    total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    active_users = conn.execute("SELECT COUNT(*) FROM users WHERE status = 'Active'").fetchone()[0]
    blocked_users = conn.execute("SELECT COUNT(*) FROM users WHERE status = 'Blocked'").fetchone()[0]
    conn.close()
    
    # Simulated "Live Noise" for a dynamic feel
    import random
    # Active sessions fluctuates based on active users
    active_sessions = max(2, active_users + random.randint(0, 3))
    # Query count shows slight simulated growth for UI flair
    display_queries = actual_queries + random.randint(0, 5)
    
    return {
        "totalUsers": total_users,
        "totalQueries": display_queries,
        "activeSessions": active_sessions,
        "flaggedItems": blocked_users
    }

@router.get("/audit-logs")
def get_logs():
    conn = get_db_connection()
    logs = [dict(row) for row in conn.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC").fetchall()]
    conn.close()
    return logs

@router.post("/audit-logs")
def add_log(log: dict):
    conn = get_db_connection()
    conn.execute("INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?)", 
                (log.get("id"), log.get("user"), log.get("action"), log.get("timestamp"), log.get("severity")))
    conn.commit()
    conn.close()
    return {"status": "ok"}
