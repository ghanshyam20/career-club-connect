from django.db import connection
from django.db.utils import OperationalError
from django.http import JsonResponse
from django.views.decorators.http import require_GET

@require_GET
def live(request):
    return JsonResponse({'status': 'ok'})

@require_GET
def ready(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
    except OperationalError:
        return JsonResponse({'status': 'error', 'database': 'unavailable'}, status=503)
    return JsonResponse({'status': 'ok', 'database': 'ok'})
