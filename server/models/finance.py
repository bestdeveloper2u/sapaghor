from datetime import datetime
from server.extensions import db

PAYMENT_METHODS = ['cash', 'bank_transfer', 'mobile_banking', 'cheque', 'credit']
PAYMENT_TYPES = ['advance', 'partial', 'full', 'refund']
INVOICE_STATUS = ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(20), unique=True, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    
    invoice_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime)
    
    subtotal = db.Column(db.Numeric(12, 2), default=0)
    discount = db.Column(db.Numeric(12, 2), default=0)
    tax_rate = db.Column(db.Numeric(5, 2), default=0)
    tax_amount = db.Column(db.Numeric(12, 2), default=0)
    total_amount = db.Column(db.Numeric(12, 2), default=0)
    paid_amount = db.Column(db.Numeric(12, 2), default=0)
    
    status = db.Column(db.String(20), default='draft')
    notes = db.Column(db.Text)
    terms = db.Column(db.Text)
    
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def generate_invoice_number(self):
        today = datetime.now()
        prefix = f"INV{today.strftime('%y%m')}"
        last_invoice = Invoice.query.filter(
            Invoice.invoice_number.like(f"{prefix}%")
        ).order_by(Invoice.id.desc()).first()
        
        if last_invoice:
            last_num = int(last_invoice.invoice_number[-4:])
            new_num = str(last_num + 1).zfill(4)
        else:
            new_num = "0001"
        
        return f"{prefix}{new_num}"
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'order_id': self.order_id,
            'invoice_date': self.invoice_date.isoformat() if self.invoice_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'subtotal': float(self.subtotal) if self.subtotal else 0,
            'discount': float(self.discount) if self.discount else 0,
            'tax_rate': float(self.tax_rate) if self.tax_rate else 0,
            'tax_amount': float(self.tax_amount) if self.tax_amount else 0,
            'total_amount': float(self.total_amount) if self.total_amount else 0,
            'paid_amount': float(self.paid_amount) if self.paid_amount else 0,
            'status': self.status,
            'notes': self.notes
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    payment_number = db.Column(db.String(20), unique=True, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'))
    
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    payment_type = db.Column(db.String(20), default='partial')
    payment_method = db.Column(db.String(30), default='cash')
    
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    reference_number = db.Column(db.String(100))
    
    notes = db.Column(db.Text)
    
    received_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def generate_payment_number(self):
        today = datetime.now()
        prefix = f"PAY{today.strftime('%y%m')}"
        last_payment = Payment.query.filter(
            Payment.payment_number.like(f"{prefix}%")
        ).order_by(Payment.id.desc()).first()
        
        if last_payment:
            last_num = int(last_payment.payment_number[-4:])
            new_num = str(last_num + 1).zfill(4)
        else:
            new_num = "0001"
        
        return f"{prefix}{new_num}"
    
    def to_dict(self):
        return {
            'id': self.id,
            'payment_number': self.payment_number,
            'order_id': self.order_id,
            'amount': float(self.amount) if self.amount else 0,
            'payment_type': self.payment_type,
            'payment_method': self.payment_method,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'reference_number': self.reference_number,
            'notes': self.notes
        }

class Expense(db.Model):
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    expense_number = db.Column(db.String(20), unique=True)
    
    category = db.Column(db.String(50))
    description = db.Column(db.Text)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    
    payment_method = db.Column(db.String(30), default='cash')
    reference_number = db.Column(db.String(100))
    
    expense_date = db.Column(db.DateTime, default=datetime.utcnow)
    vendor_name = db.Column(db.String(150))
    
    receipt_path = db.Column(db.String(500))
    notes = db.Column(db.Text)
    
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'expense_number': self.expense_number,
            'category': self.category,
            'description': self.description,
            'amount': float(self.amount) if self.amount else 0,
            'payment_method': self.payment_method,
            'expense_date': self.expense_date.isoformat() if self.expense_date else None,
            'vendor_name': self.vendor_name,
            'notes': self.notes
        }
