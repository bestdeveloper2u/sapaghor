from flask import Blueprint

api = Blueprint('api', __name__)

from server.routes import auth, customers, orders, design, production, delivery, finance, dashboard, users
from server.routes.shareholder import shareholder_bp
from server.routes.tasks import tasks_bp
from server.routes.notifications import notifications_bp

# Register new blueprints
api.register_blueprint(shareholder_bp)
api.register_blueprint(tasks_bp)
api.register_blueprint(notifications_bp)
