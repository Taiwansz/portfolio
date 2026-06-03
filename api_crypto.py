from flask import Blueprint, jsonify, request
from models import PortfolioItem
from database import db

crypto_bp = Blueprint('crypto_bp', __name__)

@crypto_bp.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    items = PortfolioItem.query.all()
    return jsonify([{'id': i.id, 'coin_id': i.coin_id, 'amount': i.amount, 'buy_price': i.buy_price} for i in items])

@crypto_bp.route('/api/portfolio', methods=['POST'])
def add_portfolio_item():
    data = request.json
    new_item = PortfolioItem(coin_id=data['coin_id'], amount=data['amount'], buy_price=data['buy_price'])
    db.session.add(new_item)
    db.session.commit()
    return jsonify({'id': new_item.id})

@crypto_bp.route('/api/portfolio/<int:item_id>', methods=['DELETE'])
def delete_portfolio_item(item_id):
    item = PortfolioItem.query.get(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404
        
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item deleted successfully', 'id': item_id}), 200
