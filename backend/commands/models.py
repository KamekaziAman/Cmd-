from django.conf import settings
from django.db import models

# Create your models here.


class Command(models.Model):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="commands",
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    command = models.TextField()
    labels = models.ManyToManyField("Label", related_name="commands")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Label(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name
