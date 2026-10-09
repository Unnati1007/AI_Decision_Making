# ============================================================
# IntelliChoice — Password Security Unit Tests
# ============================================================

import os
import sys
import unittest
import sqlite3
from fastapi.testclient import TestClient

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.main import app
from backend.routes.admin_route import get_db_connection, init_db

client = TestClient(app)


class TestAuthSecurity(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()

    def test_passwords_in_db_are_hashed(self):
        """Test that passwords stored in the database are hashed (not plaintext)."""
        conn = get_db_connection()
        rows = conn.execute("SELECT email, password FROM users").fetchall()
        conn.close()

        self.assertGreater(len(rows), 0, "Users table should not be empty")

        for row in rows:
            password = row["password"]
            if password:
                self.assertTrue(
                    password.startswith("$2b$") or password.startswith("$2a$") or password.startswith("$2y$"),
                    "Password stored in DB is not a valid bcrypt hash"
                )
                self.assertNotIn("admin123", password)
                self.assertNotIn("user123", password)
                self.assertNotIn("demo123", password)

    def test_get_users_api_does_not_contain_password(self):
        """Test that GET /admin/users response does not contain password field."""
        response = client.get("/admin/users")
        self.assertEqual(response.status_code, 200)
        users = response.json()
        self.assertIsInstance(users, list)
        self.assertGreater(len(users), 0)

        for u in users:
            self.assertNotIn("password", u, "API response for GET /admin/users returned password field")

    def test_login_api_does_not_contain_password(self):
        """Test that POST /admin/users/login response does not contain password field."""
        response = client.post("/admin/users/login", json={
            "email": "admin@intellichoice.ai",
            "password": "admin123"
        })
        self.assertEqual(response.status_code, 200)
        user_data = response.json()
        self.assertNotIn("password", user_data, "API response for POST /admin/users/login returned password field")
        self.assertEqual(user_data["email"], "admin@intellichoice.ai")

    def test_register_api_does_not_contain_password(self):
        """Test that POST /admin/users/register response does not contain password field."""
        test_id = f"test-sec-{os.urandom(4).hex()}"
        response = client.post("/admin/users/register", json={
            "id": test_id,
            "name": "Security Test User",
            "email": f"{test_id}@test.ai",
            "password": "secretpassword123",
            "role": "user",
            "domain": "Career",
            "queryCount": 0,
            "joined": "2026-10-09",
            "status": "Active"
        })
        self.assertEqual(response.status_code, 200)
        reg_data = response.json()
        self.assertNotIn("password", reg_data, "API response for POST /admin/users/register returned password field")


if __name__ == "__main__":
    unittest.main()
