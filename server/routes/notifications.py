from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from server.extensions import db
from server.models.notification import Notification
from datetime import datetime

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notifications_bp.route('', methods=['GET'])
@login_required
def list_notifications():
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    
    query = Notification.query.filter_by(user_id=current_user.id)
    
    if unread_only:
        query = query.filter_by(is_read=False)
    
    notifications = query.order_by(Notification.created_at.desc()).limit(50).all()
    
    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
    })

@notifications_bp.route('/<int:notification_id>/read', methods=['POST'])
@login_required
def mark_as_read(notification_id):
    notification = Notification.query.get_or_404(notification_id)
    
    if notification.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    notification.is_read = True
    db.session.commit()
    
    return jsonify(notification.to_dict())

@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
@login_required
def delete_notification(notification_id):
    notification = Notification.query.get_or_404(notification_id)
    
    if notification.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(notification)
    db.session.commit()
    
    return jsonify({'message': 'Notification deleted'})

@notifications_bp.route('', methods=['POST'])
@login_required
def create_notification():
    data = request.get_json()
    
    notification = Notification(
        user_id=data.get('user_id'),
        title=data.get('title'),
        message=data.get('message'),
        notification_type=data.get('notification_type', 'info'),
        action_url=data.get('action_url'),
        role_based=data.get('role_based')
    )
    
    db.session.add(notification)
    db.session.commit()
    
    return jsonify(notification.to_dict()), 201
