import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from server.config import Config
from server.extensions import db, login_manager
from server.models import User, Role

def create_app():
    app = Flask(__name__, static_folder='../client/dist', static_url_path='')
    app.config.from_object(Config)
    
    CORS(app, supports_credentials=True)
    
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'api.login'
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    from server.routes import api
    app.register_blueprint(api, url_prefix='/api')
    
    @app.route('/')
    @app.route('/<path:path>')
    def serve(path=''):
        if path and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')
    
    with app.app_context():
        db.create_all()
        init_roles()
        init_admin_user()
    
    return app

def init_roles():
    roles = [
        {'name': 'Super Admin', 'description': 'Full access to all modules', 'permissions': {'all': True}},
        {'name': 'Management', 'description': 'Oversight and reports access', 'permissions': {'orders': True, 'reports': True, 'customers': True}},
        {'name': 'Shareholder', 'description': 'Financial reports and analytics', 'permissions': {'reports': True, 'finance': True}},
        {'name': 'Designer', 'description': 'Design module access', 'permissions': {'design': True, 'orders': 'view'}},
        {'name': 'Production', 'description': 'Production module access', 'permissions': {'production': True, 'orders': 'view'}},
        {'name': 'Accountant', 'description': 'Finance module access', 'permissions': {'finance': True, 'orders': 'view', 'customers': True}},
        {'name': 'Delivery', 'description': 'Delivery module access', 'permissions': {'delivery': True, 'orders': 'view'}},
        {'name': 'Employee', 'description': 'Basic employee access', 'permissions': {'orders': 'view'}},
    ]
    
    for role_data in roles:
        if not Role.query.filter_by(name=role_data['name']).first():
            role = Role(**role_data)
            db.session.add(role)
    
    db.session.commit()

def init_admin_user():
    if not User.query.filter_by(username='admin').first():
        admin_role = Role.query.filter_by(name='Super Admin').first()
        admin = User(
            username='admin',
            email='admin@sapaghor.com',
            full_name='System Administrator',
            role_id=admin_role.id if admin_role else None,
            is_active=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
