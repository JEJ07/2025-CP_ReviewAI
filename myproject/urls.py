from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponseNotFound


def block_admin(request):
    return HttpResponseNotFound("<h1>404 Not Found</h1>")

urlpatterns = [
    path('admin/', block_admin),
    path('secretadmin-portal/', admin.site.urls),
    path('', include('reviewai.urls')),
    path('users/', include('users.urls')),
]
