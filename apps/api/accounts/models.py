from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Start with a custom user model before the first migration."""
    pass
