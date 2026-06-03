from flask import Blueprint, jsonify, request
from models import FavoriteCity
from database import db
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

weather_bp = Blueprint('weather_bp', __name__)

@weather_bp.route('/api/cities', methods=['GET'])
def get_cities():
    """Retrieve a list of all favorite cities."""
    try:
        cities = FavoriteCity.query.all()
        return jsonify([{'id': c.id, 'name': c.name, 'lat': c.lat, 'lon': c.lon} for c in cities]), 200
    except SQLAlchemyError:
        return jsonify({'error': 'Database error occurred while retrieving cities.'}), 500
    except Exception:
        return jsonify({'error': 'An unexpected error occurred.'}), 500

@weather_bp.route('/api/cities', methods=['POST'])
def add_city():
    """Add a new favorite city."""
    data = request.get_json(silent=True)
    
    if not data:
        return jsonify({'error': 'Invalid or missing JSON payload.'}), 400
        
    name = data.get('name')
    lat = data.get('lat')
    lon = data.get('lon')
    
    if not name or lat is None or lon is None:
        return jsonify({'error': 'Missing required fields: name, lat, and lon.'}), 400
        
    try:
        lat = float(lat)
        lon = float(lon)
    except (ValueError, TypeError):
        return jsonify({'error': 'Latitude and longitude must be valid numbers.'}), 400

    try:
        new_city = FavoriteCity(name=name, lat=lat, lon=lon)
        db.session.add(new_city)
        db.session.commit()
        return jsonify({
            'id': new_city.id, 
            'name': new_city.name, 
            'lat': new_city.lat, 
            'lon': new_city.lon
        }), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'City already exists in favorites.'}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred while adding the city.'}), 500
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'An unexpected error occurred.'}), 500

@weather_bp.route('/api/cities/<int:city_id>', methods=['DELETE'])
def delete_city(city_id):
    """Delete a favorite city by its ID."""
    try:
        city = db.session.get(FavoriteCity, city_id)
        if not city:
            return jsonify({'error': f'City with ID {city_id} not found.'}), 404
            
        db.session.delete(city)
        db.session.commit()
        return jsonify({'message': f'City with ID {city_id} successfully deleted.'}), 200
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred while deleting the city.'}), 500
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'An unexpected error occurred.'}), 500
