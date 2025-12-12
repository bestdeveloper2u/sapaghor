from flask import request, jsonify
from flask_login import login_required, current_user
from server.routes import api
from server.extensions import db
from server.models import User, Role

@api.route('/users', methods=['GET'])
@login_required
def get_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    role = request.args.get('role')
    department = request.args.get('department')
    
    query = User.query
    
    if role:
        query = query.join(Role).filter(Role.name == role)
    if department:
        query = query.filter(User.department == department)
    
    users = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'users': [u.to_dict() for u in users.items],
        'total': users.total,
        'pages': users.pages,
        'current_page': page
    })

@api.route('/users/<int:id>', methods=['GET'])
@login_required
def get_user(id):
    user = User.query.get_or_404(id)
    return jsonify(user.to_dict())

@api.route('/users', methods=['POST'])
@login_required
def create_user():
    data = request.get_json()
    
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    user = User(
        username=data.get('username'),
        email=data.get('email'),
        full_name=data.get('full_name'),
        phone=data.get('phone'),
        role_id=data.get('role_id'),
        department=data.get('department')
    )
    user.set_password(data.get('password', 'changeme123'))
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict()), 201

@api.route('/users/<int:id>', methods=['PUT'])
@login_required
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.get_json()
    
    user.full_name = data.get('full_name', user.full_name)
    user.email = data.get('email', user.email)
    user.phone = data.get('phone', user.phone)
    user.department = data.get('department', user.department)
    user.role_id = data.get('role_id', user.role_id)
    user.is_active = data.get('is_active', user.is_active)
    
    if data.get('password'):
        user.set_password(data.get('password'))
    
    db.session.commit()
    return jsonify(user.to_dict())

@api.route('/roles', methods=['GET'])
@login_required
def get_roles():
    roles = Role.query.all()
    return jsonify([r.to_dict() for r in roles])

@api.route('/roles', methods=['POST'])
@login_required
def create_role():
    data = request.get_json()
    
    role = Role(
        name=data.get('name'),
        description=data.get('description'),
        permissions=data.get('permissions', {})
    )
    
    db.session.add(role)
    db.session.commit()
    
    return jsonify(role.to_dict()), 201
