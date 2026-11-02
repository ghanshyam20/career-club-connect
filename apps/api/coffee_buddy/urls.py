from django.urls import path
from .views import CoffeeInvitationListCreateView, accept_invitation, cancel_invitation

urlpatterns = [
    path("", CoffeeInvitationListCreateView.as_view(), name="coffee-list-create"),
    path("<int:pk>/accept/", accept_invitation, name="coffee-accept"),
    path("<int:pk>/cancel/", cancel_invitation, name="coffee-cancel"),
]
