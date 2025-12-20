from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from server.extensions import db
from server.models.shareholder import Shareholder, ShareholderProfit
from datetime import datetime

shareholder_bp = Blueprint('shareholder', __name__, url_prefix='/api/shareholder')

@shareholder_bp.route('/dashboard', methods=['GET'])
@login_required
def get_shareholder_dashboard():
    shareholder = Shareholder.query.filter_by(user_id=current_user.id).first()
    
    if not shareholder:
        return jsonify({'error': 'Shareholder profile not found'}), 404
    
    profit_history = ShareholderProfit.query.filter_by(shareholder_id=shareholder.id).all()
    
    return jsonify({
        'shareholder': shareholder.to_dict(),
        'profit_history': [p.to_dict() for p in profit_history]
    })

@shareholder_bp.route('/list', methods=['GET'])
@login_required
def list_shareholders():
    shareholders = Shareholder.query.all()
    return jsonify({
        'shareholders': [s.to_dict() for s in shareholders]
    })

@shareholder_bp.route('/<int:shareholder_id>', methods=['GET'])
@login_required
def get_shareholder(shareholder_id):
    shareholder = Shareholder.query.get_or_404(shareholder_id)
    profit_history = ShareholderProfit.query.filter_by(shareholder_id=shareholder_id).all()
    
    return jsonify({
        'shareholder': shareholder.to_dict(),
        'profit_history': [p.to_dict() for p in profit_history]
    })

@shareholder_bp.route('/<int:shareholder_id>', methods=['PUT'])
@login_required
def update_shareholder(shareholder_id):
    shareholder = Shareholder.query.get_or_404(shareholder_id)
    data = request.get_json()
    
    if 'share_percentage' in data:
        shareholder.share_percentage = data['share_percentage']
    if 'invested_amount' in data:
        shareholder.invested_amount = data['invested_amount']
    
    db.session.commit()
    return jsonify(shareholder.to_dict())

@shareholder_bp.route('/<int:shareholder_id>/profit', methods=['POST'])
@login_required
def create_shareholder_profit(shareholder_id):
    shareholder = Shareholder.query.get_or_404(shareholder_id)
    data = request.get_json()
    
    profit = ShareholderProfit(
        shareholder_id=shareholder_id,
        profit_amount=data.get('profit_amount'),
        period_start=datetime.fromisoformat(data.get('period_start')),
        period_end=datetime.fromisoformat(data.get('period_end')),
        payment_status=data.get('payment_status', 'pending'),
        notes=data.get('notes')
    )
    
    shareholder.profit_earned += profit.profit_amount
    db.session.add(profit)
    db.session.commit()
    
    return jsonify(profit.to_dict()), 201
