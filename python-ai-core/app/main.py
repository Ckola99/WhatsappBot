from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from google_sync import sync_contact
from datetime import datetime, timedelta

app = FastAPI()

class Message(BaseModel):
    message: str
    phone: Optional[str] = None

contact_state = {}

@app.post("/reply")
def generate_reply(data: Message):
    msg = data.message.strip().lower()
    phone = data.phone

    if phone not in contact_state:
        contact_state[phone] = {}

    state = contact_state[phone]
    now = datetime.now()

    # Reset after 24 hours of inactivity
    if 'last_message_time' in state:
        if now - state['last_message_time'] > timedelta(minutes=1440):
            contact_state[phone] = {}
            return {
                "reply": "Hey 👋 just checking in! Would you still like to continue our chat?"
            }

    state['last_message_time'] = now

    # Initial message
    if 'step' not in state:
        state['step'] = 'awaiting_topic'
        return {
            "reply": (
                "Thank you for contacting Matshepo! Please let us know how we can help you.\n"
                'Type "Blossom" for Weightloss Products or type "Tribe" to join the Manifestation Group'
            )
        }

    # Step: Choose topic
    if state['step'] == 'awaiting_topic':
        if 'blossom' in msg:
            state['choice'] = 'blossom'
            state['step'] = 'ask_name'
            return {"reply": "Please share your name so we can save your number."}
        elif 'tribe' in msg:
            state['choice'] = 'tribe'
            state['step'] = 'ask_name'
            return {"reply": "Please share your name so we can save your number."}
        else:
            return {"reply": "Please type 'Blossom' or 'Tribe' to proceed."}

    # Step: Ask for name
    if state['step'] == 'ask_name':
        state['name'] = msg.title()
        if state['choice'] == 'blossom':
            state['step'] = 'blossom_options'
            return {
                "reply": (
                    f"Awesome {state['name']}, please watch the following short video that will cover all needed information.\n"
                    "When done please message respond with:\n"
                    "1 - To buy\n"
                    "2 - To Join\n\n"
                    "Watch here:\n"
                    "https://youtu.be/ikQgwuWt0e0?si=_bYTZGQB5q5UCBX3"
                )
            }
        elif state['choice'] == 'tribe':
            state['step'] = 'tribe_rules'
            return {
                "reply": (
                    f"Awesome {state['name']},\nPlease read the rules of the group and type:\n\n"
                    "1 - To agree\n"
                    "2 - To disagree\n\n"
                    "**GROUP RULES**\n\n"
                    "1) This is a safe space so let's never make anyone feel small or any other emotion that's not on the positive spectrum. ❤\n\n"
                    "2) We have different countries and cultures here so let’s not discriminate or make anyone feel left out, thus ENGLISH is the language of communication in the group.\n\n"
                    "3) Any form of negative energy is grounds for you to be removed unless you are feeling weak in spirit and are asking for help. 😆\n\n"
                    "4) You have made a commitment, stick to it... 😃 You are free to leave if at any time you feel uncomfortable. (this includes participating in visualisation in the morning and all other activities)\n\n"
                    "5) Let's have the best time of our lives creating our best versions 😁🥳\n\n"
                    "6) You can quote religious texts or refer to them but please don't push any agendas of trying to convince anyone that what you believe is true. Everyone here is entitled to believe what they want.\n\n"
                    "7) We know where good morning comes from and please be aware that we still say it here as we attached no 'negative' meaning to it. You are more than welcome to say Grand Rising or any other vocabulary that sits well with you.\n\n"
                    "8) Universe, Divine, Source, Spirit, God, Allah etc are all titles. If someone says it in a way you don't like, change it in your mind to suit the title you can align with but don't miss someone's message just because you close off after hearing a title you don't use.\n\n"
                    "9) Be slow to anger. No one is out here to get you. Before getting into your emotions, clarify someone's intent and also look within as to why it triggered you.\n\n"
                    "10) In the morning before 11:11, DO NOT GREET, instead send ONE AFFIRMATION that boosts your spirit. This will contribute to the collective affirmations that we read at 11:11 to increase our vibrational energy for the day. Please let it be less than 4 lines.\n\n"
                    "11) You CANNOT use this group to advertise your business. If you are found doing this or sending DMs to members without their consent, you will be removed with immediate effect.\n\n"
                    "12) A Voice Chat is prohibited unless Matshepo is the one initiating it. Or any admin personal in agreement with Matshepo.\n\n"
                    "13) Individuals will be REMOVED IMMEDIATELY from the group for the following:\n"
                    "i) Posting pictures during affirmations. All affirmations MUST BE TYPED.\n"
                    "ii) Sending competition links and/or any other links that do not align with the group’s purpose.\n"
                    "iii) Selling and/or promoting your business or anyone’s business.\n"
                    "iv) Forex, get rich quick schemes or any financial markets."
                )
            }

    # Step: Blossom path (after watching video)
    if state.get('step') == 'blossom_options':
        if msg == '1':
            state['step'] = 'complete'
            sync_contact(name=state['name'], phone=phone, location="Blossom Buyer")
            return {
                "reply": (
                    "https://Blossombloom.me/product-details-customer.php?id=51&ref=GT49863&tok=482640\n\n"
                    "Thank you for your purchase.\n\n"
                    "Any queries on your order once placed, please email:\n"
                    "support@blossombloom.me"
                ),
                "complete": True
            }
        elif msg == '2':
            state['step'] = 'complete'
            sync_contact(name=state['name'], phone=phone, location="Blossom Joiner")
            return {
                "reply": (
                    "https://blossombloom.me/dashboard/register.php?ref=Matshepoblooms\n\n"
                    "Thank you for choosing our team.\n\n"
                    "Any queries on your order once placed, please email:\n"
                    "support@blossombloom.me\n\n"
                    "We will reach out to you once you have signed up to help you get started."
                ),
                "complete": True
            }
        else:
            return {"reply": "Please reply with:\n1 - To buy\n2 - To join"}

    # Step: Tribe rules confirmation
    if state.get('step') == 'tribe_rules':
        if msg == '1':
            state['step'] = 'complete'
            sync_contact(name=state['name'], phone=phone, location="Tribe Group")
            return {
                "reply": (
                    "Thank you, you will be added to the group month end.\n"
                    "We have lives on Matshepo’s page on Wednesdays and Sundays, do join us. 🙏🏾"
                ),
                "complete": True
            }
        elif msg == '2':
            state['step'] = 'complete'
            return {"reply": "Thank you for contacting us, have a pleasant day.", "complete": True}
        else:
            return {"reply": "Please reply with:\n1 - To agree\n2 - To disagree"}

    return {"reply": "How can I assist you today?"}
