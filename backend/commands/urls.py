from rest_framework.routers import DefaultRouter
from .views import CommandViewSet

router = DefaultRouter()
router.register(r"commands", CommandViewSet, basename="commands")

urlpatterns = router.urls
