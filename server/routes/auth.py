from flask import request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime
from server.routes import api
from server.extensions import db
from server.models import User, Role

@api.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        if not user.is_active:
            return jsonify({'error': 'Account is disabled'}), 403
        
        user.last_login = datetime.utcnow()
        db.session.commit()
        login_user(user)
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        })
    
    return jsonify({'error': 'Invalid username or password'}), 401

@api.route('/auth/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@api.route('/auth/me', methods=['GET'])
@login_required
def get_current_user():
    return jsonify(current_user.to_dict())

@api.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    default_role = Role.query.filter_by(name='Employee').first()
    
    user = User(
        username=data.get('username'),
        email=data.get('email'),
        full_name=data.get('full_name'),
        phone=data.get('phone'),
        role_id=default_role.id if default_role else None,
        department=data.get('department')
    )
    user.set_password(data.get('password'))
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict()
    }), 201
