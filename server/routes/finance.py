from flask import request, jsonify
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from server.routes import api
from server.extensions import db
from server.models import Invoice, Payment, Expense, Order

@api.route('/invoices', methods=['GET'])
@login_required
def get_invoices():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    
    query = Invoice.query
    
    if status:
        query = query.filter(Invoice.status == status)
    
    invoices = query.order_by(Invoice.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'invoices': [i.to_dict() for i in invoices.items],
        'total': invoices.total,
        'pages': invoices.pages,
        'current_page': page
    })

@api.route('/invoices/<int:id>', methods=['GET'])
@login_required
def get_invoice(id):
    invoice = Invoice.query.get_or_404(id)
    return jsonify(invoice.to_dict())

@api.route('/invoices', methods=['POST'])
@login_required
def create_invoice():
    data = request.get_json()
    
    order = Order.query.get_or_404(data.get('order_id'))
    
    invoice = Invoice(
        order_id=order.id,
        due_date=datetime.fromisoformat(data.get('due_date')) if data.get('due_date') else datetime.utcnow() + timedelta(days=30),
        subtotal=order.subtotal,
        discount=order.discount,
        tax_rate=data.get('tax_rate', 0),
        tax_amount=(float(order.subtotal) - float(order.discount)) * (float(data.get('tax_rate', 0)) / 100),
        notes=data.get('notes'),
        terms=data.get('terms'),
        created_by=current_user.id
    )
    
    invoice.total_amount = float(invoice.subtotal) - float(invoice.discount) + float(invoice.tax_amount)
    invoice.invoice_number = invoice.generate_invoice_number()
    
    db.session.add(invoice)
    db.session.commit()
    
    return jsonify(invoice.to_dict()), 201

@api.route('/invoices/<int:id>/send', methods=['POST'])
@login_required
def send_invoice(id):
    invoice = Invoice.query.get_or_404(id)
    invoice.status = 'sent'
    db.session.commit()
    return jsonify(invoice.to_dict())

@api.route('/payments', methods=['GET'])
@login_required
def get_payments():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    order_id = request.args.get('order_id', type=int)
    payment_method = request.args.get('payment_method')
    
    query = Payment.query
    
    if order_id:
        query = query.filter(Payment.order_id == order_id)
    if payment_method:
        query = query.filter(Payment.payment_method == payment_method)
    
    payments = query.order_by(Payment.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'payments': [p.to_dict() for p in payments.items],
        'total': payments.total,
        'pages': payments.pages,
        'current_page': page
    })

@api.route('/payments', methods=['POST'])
@login_required
def create_payment():
    data = request.get_json()
    
    order = Order.query.get_or_404(data.get('order_id'))
    
    payment = Payment(
        order_id=order.id,
        invoice_id=data.get('invoice_id'),
        amount=data.get('amount'),
        payment_type=data.get('payment_type', 'partial'),
        payment_method=data.get('payment_method', 'cash'),
        reference_number=data.get('reference_number'),
        notes=data.get('notes'),
        received_by=current_user.id
    )
    
    payment.payment_number = payment.generate_payment_number()
    
    db.session.add(payment)
    
    order.paid_amount = float(order.paid_amount or 0) + float(payment.amount)
    order.update_totals()
    
    if data.get('invoice_id'):
        invoice = Invoice.query.get(data.get('invoice_id'))
        if invoice:
            invoice.paid_amount = float(invoice.paid_amount or 0) + float(payment.amount)
            if invoice.paid_amount >= invoice.total_amount:
                invoice.status = 'paid'
            else:
                invoice.status = 'partial'
    
    db.session.commit()
    
    return jsonify(payment.to_dict()), 201

@api.route('/expenses', methods=['GET'])
@login_required
def get_expenses():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category = request.args.get('category')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Expense.query
    
    if category:
        query = query.filter(Expense.category == category)
    if start_date:
        query = query.filter(Expense.expense_date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Expense.expense_date <= datetime.fromisoformat(end_date))
    
    expenses = query.order_by(Expense.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'expenses': [e.to_dict() for e in expenses.items],
        'total': expenses.total,
        'pages': expenses.pages,
        'current_page': page
    })

@api.route('/expenses', methods=['POST'])
@login_required
def create_expense():
    data = request.get_json()
    
    expense = Expense(
        category=data.get('category'),
        description=data.get('description'),
        amount=data.get('amount'),
        payment_method=data.get('payment_method', 'cash'),
        reference_number=data.get('reference_number'),
        expense_date=datetime.fromisoformat(data.get('expense_date')) if data.get('expense_date') else datetime.utcnow(),
        vendor_name=data.get('vendor_name'),
        notes=data.get('notes'),
        created_by=current_user.id
    )
    
    today = datetime.now()
    prefix = f"EXP{today.strftime('%y%m')}"
    last_expense = Expense.query.filter(
        Expense.expense_number.like(f"{prefix}%")
    ).order_by(Expense.id.desc()).first()
    
    if last_expense and last_expense.expense_number:
        last_num = int(last_expense.expense_number[-4:])
        new_num = str(last_num + 1).zfill(4)
    else:
        new_num = "0001"
    
    expense.expense_number = f"{prefix}{new_num}"
    
    db.session.add(expense)
    db.session.commit()
    
    return jsonify(expense.to_dict()), 201

@api.route('/expense-categories', methods=['GET'])
@login_required
def get_expense_categories():
    return jsonify([
        'materials', 'utilities', 'rent', 'salary', 'transport',
        'maintenance', 'marketing', 'office_supplies', 'other'
    ])

@api.route('/payment-methods', methods=['GET'])
@login_required
def get_payment_methods():
    return jsonify(['cash', 'bank_transfer', 'mobile_banking', 'cheque', 'credit'])
