from rest_framework import filters, permissions, viewsets
from rest_framework.authentication import TokenAuthentication

from .models import Command
from .serializers import CommandSerializer
from django_filters.rest_framework import DjangoFilterBackend


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user
        return user.is_authenticated and (user.is_staff or obj.created_by_id == user.id)


class CommandViewSet(viewsets.ModelViewSet):
    queryset = (
        Command.objects.select_related("created_by")
        .prefetch_related("labels")
        .order_by("-created_at")
    )
    serializer_class = CommandSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["labels"]
    search_fields = ["title", "description"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
