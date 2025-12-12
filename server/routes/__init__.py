from flask import Blueprint

api = Blueprint('api', __name__)

from server.routes import auth, customers, orders, design, production, delivery, finance, dashboard, users
