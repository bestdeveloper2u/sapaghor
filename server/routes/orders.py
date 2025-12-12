from flask import request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from server.routes import api
from server.extensions import db
from server.models import Order, OrderItem, OrderStatusHistory, Customer

@api.route('/orders', methods=['GET'])
@login_required
def get_orders():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    order_type = request.args.get('order_type')
    customer_id = request.args.get('customer_id', type=int)
    search = request.args.get('search', '')
    
    query = Order.query
    
    if status:
        query = query.filter(Order.status == status)
    if order_type:
        query = query.filter(Order.order_type == order_type)
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    if search:
        query = query.filter(
            db.or_(
                Order.order_number.ilike(f'%{search}%'),
                Order.work_name.ilike(f'%{search}%')
            )
        )
    
    orders = query.order_by(Order.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'orders': [o.to_dict() for o in orders.items],
        'total': orders.total,
        'pages': orders.pages,
        'current_page': page
    })

@api.route('/orders/<int:id>', methods=['GET'])
@login_required
def get_order(id):
    order = Order.query.get_or_404(id)
    return jsonify(order.to_dict())

@api.route('/orders', methods=['POST'])
@login_required
def create_order():
    data = request.get_json()
    
    customer = Customer.query.get_or_404(data.get('customer_id'))
    
    order = Order(
        customer_id=customer.id,
        order_type=data.get('order_type', 'regular_order'),
        status='pre_order' if data.get('order_type') == 'pre_order' else 'order_placed',
        work_name=data.get('work_name'),
        description=data.get('description'),
        expected_delivery_date=datetime.fromisoformat(data.get('expected_delivery_date')) if data.get('expected_delivery_date') else None,
        discount=data.get('discount', 0),
        special_instructions=data.get('special_instructions'),
        internal_notes=data.get('internal_notes'),
        created_by=current_user.id
    )
    
    order.order_number = order.generate_order_number()
    db.session.add(order)
    db.session.flush()
    
    for item_data in data.get('items', []):
        item = OrderItem(
            order_id=order.id,
            product_name=item_data.get('product_name'),
            description=item_data.get('description'),
            quantity=item_data.get('quantity', 1),
            size=item_data.get('size'),
            color=item_data.get('color'),
            material_type=item_data.get('material_type'),
            unit_price=item_data.get('unit_price', 0),
            total_price=item_data.get('quantity', 1) * item_data.get('unit_price', 0),
            specifications=item_data.get('specifications', {})
        )
        db.session.add(item)
    
    order.update_totals()
    
    status_history = OrderStatusHistory(
        order_id=order.id,
        status=order.status,
        notes='Order created',
        changed_by=current_user.id
    )
    db.session.add(status_history)
    
    db.session.commit()
    return jsonify(order.to_dict()), 201

@api.route('/orders/<int:id>', methods=['PUT'])
@login_required
def update_order(id):
    order = Order.query.get_or_404(id)
    data = request.get_json()
    
    order.work_name = data.get('work_name', order.work_name)
    order.description = data.get('description', order.description)
    order.expected_delivery_date = datetime.fromisoformat(data.get('expected_delivery_date')) if data.get('expected_delivery_date') else order.expected_delivery_date
    order.discount = data.get('discount', order.discount)
    order.special_instructions = data.get('special_instructions', order.special_instructions)
    order.internal_notes = data.get('internal_notes', order.internal_notes)
    
    if data.get('items'):
        OrderItem.query.filter_by(order_id=order.id).delete()
        for item_data in data.get('items', []):
            item = OrderItem(
                order_id=order.id,
                product_name=item_data.get('product_name'),
                description=item_data.get('description'),
                quantity=item_data.get('quantity', 1),
                size=item_data.get('size'),
                color=item_data.get('color'),
                material_type=item_data.get('material_type'),
                unit_price=item_data.get('unit_price', 0),
                total_price=item_data.get('quantity', 1) * item_data.get('unit_price', 0)
            )
            db.session.add(item)
        order.update_totals()
    
    db.session.commit()
    return jsonify(order.to_dict())

@api.route('/orders/<int:id>/status', methods=['PUT'])
@login_required
def update_order_status(id):
    order = Order.query.get_or_404(id)
    data = request.get_json()
    new_status = data.get('status')
    notes = data.get('notes', '')
    
    if new_status:
        old_status = order.status
        order.status = new_status
        
        if new_status == 'delivered':
            order.actual_delivery_date = datetime.utcnow()
        
        status_history = OrderStatusHistory(
            order_id=order.id,
            status=new_status,
            notes=f'Status changed from {old_status} to {new_status}. {notes}',
            changed_by=current_user.id
        )
        db.session.add(status_history)
        db.session.commit()
    
    return jsonify(order.to_dict())

@api.route('/orders/<int:id>/history', methods=['GET'])
@login_required
def get_order_history(id):
    order = Order.query.get_or_404(id)
    history = OrderStatusHistory.query.filter_by(order_id=id).order_by(OrderStatusHistory.changed_at.desc()).all()
    return jsonify([h.to_dict() for h in history])

@api.route('/order-statuses', methods=['GET'])
@login_required
def get_order_statuses():
    from server.models.order import ORDER_STATUS
    return jsonify(ORDER_STATUS)
