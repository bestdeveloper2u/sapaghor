from flask import jsonify
from flask_login import login_required
from datetime import datetime, timedelta
from sqlalchemy import func
from server.routes import api
from server.extensions import db
from server.models import Order, Customer, Payment, Expense, InventoryItem, Delivery

@api.route('/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    today = datetime.utcnow().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    today_orders = Order.query.filter(
        func.date(Order.created_at) == today
    ).count()
    
    week_orders = Order.query.filter(
        func.date(Order.created_at) >= week_ago
    ).count()
    
    month_orders = Order.query.filter(
        func.date(Order.created_at) >= month_ago
    ).count()
    
    total_orders = Order.query.count()
    
    pending_orders = Order.query.filter(
        Order.status.notin_(['delivered', 'cancelled'])
    ).count()
    
    total_customers = Customer.query.filter_by(is_active=True).count()
    
    month_revenue = db.session.query(func.sum(Payment.amount)).filter(
        func.date(Payment.payment_date) >= month_ago
    ).scalar() or 0
    
    pending_payments = db.session.query(func.sum(Order.due_amount)).filter(
        Order.due_amount > 0
    ).scalar() or 0
    
    month_expenses = db.session.query(func.sum(Expense.amount)).filter(
        func.date(Expense.expense_date) >= month_ago
    ).scalar() or 0
    
    low_stock_items = InventoryItem.query.filter(
        InventoryItem.current_stock <= InventoryItem.minimum_stock,
        InventoryItem.is_active == True
    ).count()
    
    today_deliveries = Delivery.query.filter(
        func.date(Delivery.scheduled_date) == today
    ).count()
    
    return jsonify({
        'orders': {
            'today': today_orders,
            'week': week_orders,
            'month': month_orders,
            'total': total_orders,
            'pending': pending_orders
        },
        'customers': {
            'total': total_customers
        },
        'finance': {
            'month_revenue': float(month_revenue),
            'pending_payments': float(pending_payments),
            'month_expenses': float(month_expenses),
            'net_income': float(month_revenue) - float(month_expenses)
        },
        'inventory': {
            'low_stock_items': low_stock_items
        },
        'deliveries': {
            'today': today_deliveries
        }
    })

@api.route('/dashboard/orders-by-status', methods=['GET'])
@login_required
def get_orders_by_status():
    status_counts = db.session.query(
        Order.status,
        func.count(Order.id)
    ).group_by(Order.status).all()
    
    return jsonify({status: count for status, count in status_counts})

@api.route('/dashboard/recent-orders', methods=['GET'])
@login_required
def get_recent_orders():
    orders = Order.query.order_by(Order.created_at.desc()).limit(10).all()
    return jsonify([o.to_dict() for o in orders])

@api.route('/dashboard/pending-deliveries', methods=['GET'])
@login_required
def get_pending_deliveries():
    deliveries = Delivery.query.filter(
        Delivery.status.in_(['scheduled', 'out_for_delivery'])
    ).order_by(Delivery.scheduled_date.asc()).limit(10).all()
    return jsonify([d.to_dict() for d in deliveries])

@api.route('/dashboard/revenue-trend', methods=['GET'])
@login_required
def get_revenue_trend():
    thirty_days_ago = datetime.utcnow().date() - timedelta(days=30)
    
    daily_revenue = db.session.query(
        func.date(Payment.payment_date),
        func.sum(Payment.amount)
    ).filter(
        func.date(Payment.payment_date) >= thirty_days_ago
    ).group_by(func.date(Payment.payment_date)).all()
    
    return jsonify([
        {'date': str(date), 'revenue': float(amount or 0)}
        for date, amount in daily_revenue
    ])
