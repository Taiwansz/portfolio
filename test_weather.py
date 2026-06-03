import unittest
from app import app
from database import db
from models import FavoriteCity
import json

class AuraWeatherTests(unittest.TestCase):
    def setUp(self):
        # Configure the app for testing
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()
        
        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_add_city(self):
        response = self.app.post('/api/cities', 
            data=json.dumps({'name': 'London', 'lat': 51.5074, 'lon': -0.1278}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['name'], 'London')
        self.assertEqual(data['lat'], 51.5074)
        self.assertEqual(data['lon'], -0.1278)
        self.assertTrue('id' in data)

    def test_get_cities(self):
        # Add a city first
        self.app.post('/api/cities', 
            data=json.dumps({'name': 'Paris', 'lat': 48.8566, 'lon': 2.3522}),
            content_type='application/json'
        )
        
        response = self.app.get('/api/cities')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Paris')

    def test_add_duplicate_city(self):
        self.app.post('/api/cities', 
            data=json.dumps({'name': 'Tokyo', 'lat': 35.6762, 'lon': 139.6503}),
            content_type='application/json'
        )
        response = self.app.post('/api/cities', 
            data=json.dumps({'name': 'Tokyo', 'lat': 35.6762, 'lon': 139.6503}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'City already exists in favorites.')

    def test_delete_city(self):
        # Add a city
        add_res = self.app.post('/api/cities', 
            data=json.dumps({'name': 'Berlin', 'lat': 52.52, 'lon': 13.405}),
            content_type='application/json'
        )
        city_id = json.loads(add_res.data)['id']
        
        # Delete it
        del_res = self.app.delete(f'/api/cities/{city_id}')
        self.assertEqual(del_res.status_code, 200)
        
        # Verify deletion
        get_res = self.app.get('/api/cities')
        self.assertEqual(len(json.loads(get_res.data)), 0)

    def test_delete_nonexistent_city(self):
        response = self.app.delete('/api/cities/999')
        self.assertEqual(response.status_code, 404)

    def test_add_city_invalid_data(self):
        response = self.app.post('/api/cities', 
            data=json.dumps({'name': 'InvalidCity'}), # Missing lat/lon
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

if __name__ == '__main__':
    unittest.main()
