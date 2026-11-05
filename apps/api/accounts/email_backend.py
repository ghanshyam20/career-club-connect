
import json
import os
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

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

            request = Request(
                "https://api.resend.com/emails",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                method="POST",
            )

            try:
                with urlopen(request, timeout=15) as response:
                    if 200 <= response.status < 300:
                        sent += 1
            except (HTTPError, URLError):
                if not self.fail_silently:
                    raise

        return sent
