
from django.conf import settings
from django.db import models


class Experience(models.Model):
    class Category(models.TextChoices):
        JOB_APPLICATION = "job_application", "Job Application"
        INTERVIEW = "interview", "Interview"
        INTERNSHIP = "internship", "Internship"
        NETWORKING = "networking", "Networking"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending Review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="experiences",
    )

    title = models.CharField(max_length=150)
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
    )
    content = models.TextField(max_length=3000)

    publish_anonymously = models.BooleanField(default=False)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
