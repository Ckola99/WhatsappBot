from fastapi import FastAPI, Request
from pydantic import BaseModel

app = FastAPI()

class Message(BaseModel):
    message: str

@app.post("/reply")
def generate_reply(data: Message):
    msg = data.message.lower()

    # Dummy AI for now
    if "hello" in msg:
        reply = "Hello there! How can I assist you?"
    else:
        reply = "I'm not sure how to respond yet."

    return {"reply": reply}
