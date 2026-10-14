from django.test import TestCase

class HealthTests(TestCase):
    def test_live(self):
        response = self.client.get('/api/v1/health/live')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': 'ok'})

    def test_ready(self):
        response = self.client.get('/api/v1/health/ready')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['database'], 'ok')
