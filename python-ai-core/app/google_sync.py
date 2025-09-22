# google_sync.py
import os
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Required scope for managing contacts
SCOPES = ["https://www.googleapis.com/auth/contacts"]

TOKEN_PATH = "token.pickle"
CREDENTIALS_PATH = "credentials.json"  # download from Google Cloud Console

def get_credentials():
    """
    Load or refresh OAuth credentials.
    - For production: run once locally to generate token.pickle
      then upload to server alongside credentials.json
    """
    creds = None

    # Try loading cached token
    if os.path.exists(TOKEN_PATH):
        with open(TOKEN_PATH, "rb") as token_file:
            creds = pickle.load(token_file)

    # Refresh if expired or run interactive flow once (local only)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                print("⚠️ Failed to refresh token:", e)
        else:
            # This part requires local interactive login
            # For production, you should pre-generate token.pickle
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_PATH, SCOPES
            )
            creds = flow.run_local_server(port=0)

        # Save token for future use
        with open(TOKEN_PATH, "wb") as token_file:
            pickle.dump(creds, token_file)

    return creds


def sync_contact(name: str, phone: str, location: str) -> bool:
    """
    Syncs a contact to Google Contacts using People API.
    Returns True if successful, False otherwise.
    """
    try:
        creds = get_credentials()
        service = build("people", "v1", credentials=creds)

        contact_body = {
            "names": [{"givenName": name}],
            "phoneNumbers": [{"value": phone}],
            "addresses": [{"streetAddress": location}],
        }

        service.people().createContact(body=contact_body).execute()
        print(f"✅ Contact synced: {name} ({phone})")
        return True

    except Exception as e:
        print("❌ Failed to sync contact:", e)
        return False
