
from django.urls import path

from .views import ExperienceListCreateView, MyExperiencesView

urlpatterns = [
    path("", ExperienceListCreateView.as_view(), name="experience-list"),
    path("mine/", MyExperiencesView.as_view(), name="my-experiences"),
]
