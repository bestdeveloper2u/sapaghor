from flask import request, jsonify
from flask_login import login_required
from server.routes import api
from server.extensions import db
from server.models import Customer

@api.route('/customers', methods=['GET'])
@login_required
def get_customers():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    category = request.args.get('category')
    
    query = Customer.query
    
    if search:
        query = query.filter(
            db.or_(
                Customer.company_name.ilike(f'%{search}%'),
                Customer.contact_person.ilike(f'%{search}%'),
                Customer.phone.ilike(f'%{search}%')
            )
        )
    
    if category:
        query = query.filter(Customer.category == category)
    
    customers = query.order_by(Customer.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'customers': [c.to_dict() for c in customers.items],
        'total': customers.total,
        'pages': customers.pages,
        'current_page': page
    })

@api.route('/customers/<int:id>', methods=['GET'])
@login_required
def get_customer(id):
    customer = Customer.query.get_or_404(id)
    return jsonify(customer.to_dict())

@api.route('/customers', methods=['POST'])
@login_required
def create_customer():
    data = request.get_json()
    
    customer = Customer(
        company_name=data.get('company_name'),
        contact_person=data.get('contact_person'),
        email=data.get('email'),
        phone=data.get('phone'),
        alternate_phone=data.get('alternate_phone'),
        address=data.get('address'),
        city=data.get('city'),
        district=data.get('district'),
        category=data.get('category'),
        credit_limit=data.get('credit_limit', 0),
        notes=data.get('notes')
    )
    
    db.session.add(customer)
    db.session.commit()
    
    return jsonify(customer.to_dict()), 201

@api.route('/customers/<int:id>', methods=['PUT'])
@login_required
def update_customer(id):
    customer = Customer.query.get_or_404(id)
    data = request.get_json()
    
    customer.company_name = data.get('company_name', customer.company_name)
    customer.contact_person = data.get('contact_person', customer.contact_person)
    customer.email = data.get('email', customer.email)
    customer.phone = data.get('phone', customer.phone)
    customer.alternate_phone = data.get('alternate_phone', customer.alternate_phone)
    customer.address = data.get('address', customer.address)
    customer.city = data.get('city', customer.city)
    customer.district = data.get('district', customer.district)
    customer.category = data.get('category', customer.category)
    customer.credit_limit = data.get('credit_limit', customer.credit_limit)
    customer.notes = data.get('notes', customer.notes)
    customer.is_active = data.get('is_active', customer.is_active)
    
    db.session.commit()
    return jsonify(customer.to_dict())

@api.route('/customers/<int:id>', methods=['DELETE'])
@login_required
def delete_customer(id):
    customer = Customer.query.get_or_404(id)
    customer.is_active = False
    db.session.commit()
    return jsonify({'message': 'Customer deactivated successfully'})
