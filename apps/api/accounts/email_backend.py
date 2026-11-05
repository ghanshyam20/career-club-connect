
import os

import requests
from django.core.mail.backends.base import BaseEmailBackend


class ResendEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        api_key = os.environ.get("RESEND_API_KEY")
        if not api_key:
            raise RuntimeError("RESEND_API_KEY is not configured")

        sent = 0

        for message in email_messages:
            payload = {
                "from": message.from_email,
                "to": list(message.to),
                "subject": message.subject,
                "text": message.body,
            }

            try:
                response = requests.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                        "User-Agent": "CareerClubConnect/1.0",
                    },
                    json=payload,
                    timeout=15,
                )
                response.raise_for_status()
                sent += 1
            except requests.RequestException:
                if not self.fail_silently:
                    raise

        return sent
