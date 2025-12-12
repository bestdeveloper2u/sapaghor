from flask import request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from server.routes import api
from server.extensions import db
from server.models import Delivery, Order, User, Role

@api.route('/deliveries', methods=['GET'])
@login_required
def get_deliveries():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    delivery_person_id = request.args.get('delivery_person_id', type=int)
    date = request.args.get('date')
    
    query = Delivery.query
    
    if status:
        query = query.filter(Delivery.status == status)
    if delivery_person_id:
        query = query.filter(Delivery.delivery_person_id == delivery_person_id)
    if date:
        query = query.filter(db.func.date(Delivery.scheduled_date) == date)
    
    deliveries = query.order_by(Delivery.scheduled_date.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'deliveries': [d.to_dict() for d in deliveries.items],
        'total': deliveries.total,
        'pages': deliveries.pages,
        'current_page': page
    })

@api.route('/deliveries/<int:id>', methods=['GET'])
@login_required
def get_delivery(id):
    delivery = Delivery.query.get_or_404(id)
    return jsonify(delivery.to_dict())

@api.route('/deliveries', methods=['POST'])
@login_required
def create_delivery():
    data = request.get_json()
    
    order = Order.query.get_or_404(data.get('order_id'))
    
    delivery = Delivery(
        order_id=order.id,
        delivery_person_id=data.get('delivery_person_id'),
        delivery_address=data.get('delivery_address') or order.customer.address,
        contact_phone=data.get('contact_phone') or order.customer.phone,
        scheduled_date=datetime.fromisoformat(data.get('scheduled_date')) if data.get('scheduled_date') else None,
        notes=data.get('notes')
    )
    
    db.session.add(delivery)
    db.session.commit()
    
    return jsonify(delivery.to_dict()), 201

@api.route('/deliveries/<int:id>', methods=['PUT'])
@login_required
def update_delivery(id):
    delivery = Delivery.query.get_or_404(id)
    data = request.get_json()
    
    delivery.delivery_person_id = data.get('delivery_person_id', delivery.delivery_person_id)
    delivery.delivery_address = data.get('delivery_address', delivery.delivery_address)
    delivery.contact_phone = data.get('contact_phone', delivery.contact_phone)
    delivery.scheduled_date = datetime.fromisoformat(data.get('scheduled_date')) if data.get('scheduled_date') else delivery.scheduled_date
    delivery.status = data.get('status', delivery.status)
    delivery.notes = data.get('notes', delivery.notes)
    
    order = delivery.order
    
    if data.get('status') == 'out_for_delivery':
        order.status = 'out_for_delivery'
    elif data.get('status') == 'delivered':
        delivery.actual_delivery_date = datetime.utcnow()
        delivery.recipient_name = data.get('recipient_name')
        delivery.customer_feedback = data.get('customer_feedback')
        delivery.rating = data.get('rating')
        order.status = 'delivered'
        order.actual_delivery_date = datetime.utcnow()
    elif data.get('status') == 'failed':
        delivery.notes = data.get('failure_reason', delivery.notes)
    
    db.session.commit()
    return jsonify(delivery.to_dict())

@api.route('/delivery-personnel', methods=['GET'])
@login_required
def get_delivery_personnel():
    delivery_role = Role.query.filter_by(name='Delivery').first()
    if delivery_role:
        personnel = User.query.filter_by(role_id=delivery_role.id, is_active=True).all()
    else:
        personnel = User.query.filter_by(department='Delivery', is_active=True).all()
    return jsonify([p.to_dict() for p in personnel])
