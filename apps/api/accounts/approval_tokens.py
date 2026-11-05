from django.core import signing

SALT = "career-club-approval-v1"
MAX_AGE = 60 * 60 * 24


def create_approval_token(user):
    return signing.dumps({"user_id": user.pk}, salt=SALT)


def read_approval_token(token):
    return signing.loads(token, salt=SALT, max_age=MAX_AGE)
