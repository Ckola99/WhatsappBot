import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestAIReply(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_reply_contains_response(self):
        response = self.client.post("/reply", json={"message": "Hello"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("reply", response.json())

if __name__ == '__main__':
    unittest.main()
