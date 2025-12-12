from datetime import datetime
from server.extensions import db

ORDER_STATUS = [
    'order',           # অর্ডার
    'design_sent',     # ডিজাইনে প্রেরণ
    'proof_given',     # প্রুফ প্রদান
    'proof_complete',  # প্রুফ সম্পন্ন
    'plate_setting',   # প্লেট সেটিং এ প্রেরণ
    'printing_complete', # ছাপা সম্পন্ন
    'binding_sent',    # বাইন্ডিং এ প্রেরণ
    'order_ready',     # অর্ডার সম্পন্ন ও প্রস্তুত
    'delivered',       # ডেলিভারী প্রদান
    'cancelled'        # বাতিল
]

STATUS_LABELS = {
    'order': 'অর্ডার',
    'design_sent': 'ডিজাইনে প্রেরণ',
    'proof_given': 'প্রুফ প্রদান',
    'proof_complete': 'প্রুফ সম্পন্ন',
    'plate_setting': 'প্লেট সেটিং এ প্রেরণ',
    'printing_complete': 'ছাপা সম্পন্ন',
    'binding_sent': 'বাইন্ডিং এ প্রেরণ',
    'order_ready': 'অর্ডার সম্পন্ন ও প্রস্তুত',
    'delivered': 'ডেলিভারী প্রদান',
    'cancelled': 'বাতিল'
}

MATERIAL_LABELS = {
    'plate': 'প্লেট',
    'paper': 'কাগজ',
    'duplicate': 'ডুপ্লিকেট',
    'ink': 'কালি',
    'printing': 'ছাপা',
    'binding': 'বাইন্ডিং',
    'laminating': 'লেমিনেটিং',
    'others': 'অন্যান্য'
}

ORDER_TYPES = ['pre_order', 'regular_order']

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(20), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    order_type = db.Column(db.String(20), default='regular_order')
    status = db.Column(db.String(30), default='order')
    
    work_name = db.Column(db.String(200))
    description = db.Column(db.Text)
    
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    expected_delivery_date = db.Column(db.DateTime)
    actual_delivery_date = db.Column(db.DateTime)
    
    subtotal = db.Column(db.Numeric(12, 2), default=0)
    discount = db.Column(db.Numeric(12, 2), default=0)
    tax_amount = db.Column(db.Numeric(12, 2), default=0)
    total_amount = db.Column(db.Numeric(12, 2), default=0)
    paid_amount = db.Column(db.Numeric(12, 2), default=0)
    due_amount = db.Column(db.Numeric(12, 2), default=0)
    
    design_fee = db.Column(db.Numeric(10, 2), default=0)
    urgency_fee = db.Column(db.Numeric(10, 2), default=0)
    cashing_fee = db.Column(db.Numeric(10, 2), default=0)
    misc_fee = db.Column(db.Numeric(10, 2), default=0)
    
    payment_status = db.Column(db.String(20), default='pending')
    
    special_instructions = db.Column(db.Text)
    internal_notes = db.Column(db.Text)
    
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    status_history = db.relationship('OrderStatusHistory', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    materials = db.relationship('OrderMaterial', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    design_tasks = db.relationship('DesignTask', backref='order', lazy='dynamic')
    production_tasks = db.relationship('ProductionTask', backref='order', lazy='dynamic')
    deliveries = db.relationship('Delivery', backref='order', lazy='dynamic')
    invoices = db.relationship('Invoice', backref='order', lazy='dynamic')
    payments = db.relationship('Payment', backref='order', lazy='dynamic')
    
    def generate_order_number(self):
        today = datetime.now()
        prefix = f"SAP{today.strftime('%y%m')}"
        last_order = Order.query.filter(
            Order.order_number.like(f"{prefix}%")
        ).order_by(Order.id.desc()).first()
        
        if last_order:
            last_num = int(last_order.order_number[-4:])
            new_num = str(last_num + 1).zfill(4)
        else:
            new_num = "0001"
        
        return f"{prefix}{new_num}"
    
    def get_extra_fees_total(self):
        return (
            (self.design_fee or 0) +
            (self.urgency_fee or 0) +
            (self.cashing_fee or 0) +
            (self.misc_fee or 0)
        )
    
    def update_totals(self):
        self.subtotal = sum(item.total_price for item in self.items if item.total_price)
        extra_fees = self.get_extra_fees_total()
        self.total_amount = self.subtotal + extra_fees - (self.discount or 0) + (self.tax_amount or 0)
        self.due_amount = self.total_amount - (self.paid_amount or 0)
        
        if self.due_amount <= 0:
            self.payment_status = 'paid'
        elif self.paid_amount > 0:
            self.payment_status = 'partial'
        else:
            self.payment_status = 'pending'
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'customer': self.customer.to_dict() if self.customer else None,
            'order_type': self.order_type,
            'status': self.status,
            'status_label': STATUS_LABELS.get(self.status, self.status),
            'work_name': self.work_name,
            'description': self.description,
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'expected_delivery_date': self.expected_delivery_date.isoformat() if self.expected_delivery_date else None,
            'actual_delivery_date': self.actual_delivery_date.isoformat() if self.actual_delivery_date else None,
            'subtotal': float(self.subtotal) if self.subtotal else 0,
            'discount': float(self.discount) if self.discount else 0,
            'tax_amount': float(self.tax_amount) if self.tax_amount else 0,
            'design_fee': float(self.design_fee) if self.design_fee else 0,
            'urgency_fee': float(self.urgency_fee) if self.urgency_fee else 0,
            'cashing_fee': float(self.cashing_fee) if self.cashing_fee else 0,
            'misc_fee': float(self.misc_fee) if self.misc_fee else 0,
            'total_amount': float(self.total_amount) if self.total_amount else 0,
            'paid_amount': float(self.paid_amount) if self.paid_amount else 0,
            'due_amount': float(self.due_amount) if self.due_amount else 0,
            'payment_status': self.payment_status,
            'special_instructions': self.special_instructions,
            'items': [item.to_dict() for item in self.items],
            'materials': [material.to_dict() for material in self.materials],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    
    product_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    quantity = db.Column(db.Integer, default=1)
    size = db.Column(db.String(50))
    color = db.Column(db.String(50))
    material_type = db.Column(db.String(50))
    unit_price = db.Column(db.Numeric(10, 2), default=0)
    total_price = db.Column(db.Numeric(12, 2), default=0)
    
    plate = db.Column(db.Numeric(10, 2), default=0)
    paper = db.Column(db.Numeric(10, 2), default=0)
    duplicate = db.Column(db.Numeric(10, 2), default=0)
    ink = db.Column(db.Numeric(10, 2), default=0)
    printing = db.Column(db.Numeric(10, 2), default=0)
    binding = db.Column(db.Numeric(10, 2), default=0)
    laminating = db.Column(db.Numeric(10, 2), default=0)
    others = db.Column(db.Numeric(10, 2), default=0)
    
    specifications = db.Column(db.JSON, default={})
    
    def get_materials_total(self):
        return (
            (self.plate or 0) +
            (self.paper or 0) +
            (self.duplicate or 0) +
            (self.ink or 0) +
            (self.printing or 0) +
            (self.binding or 0) +
            (self.laminating or 0) +
            (self.others or 0)
        )
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_name': self.product_name,
            'description': self.description,
            'quantity': self.quantity,
            'size': self.size,
            'color': self.color,
            'material_type': self.material_type,
            'unit_price': float(self.unit_price) if self.unit_price else 0,
            'total_price': float(self.total_price) if self.total_price else 0,
            'plate': float(self.plate) if self.plate else 0,
            'paper': float(self.paper) if self.paper else 0,
            'duplicate': float(self.duplicate) if self.duplicate else 0,
            'ink': float(self.ink) if self.ink else 0,
            'printing': float(self.printing) if self.printing else 0,
            'binding': float(self.binding) if self.binding else 0,
            'laminating': float(self.laminating) if self.laminating else 0,
            'others': float(self.others) if self.others else 0,
            'materials_total': float(self.get_materials_total()),
            'specifications': self.specifications
        }

class OrderMaterial(db.Model):
    __tablename__ = 'order_materials'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    
    material_type = db.Column(db.String(50), nullable=False)
    material_name = db.Column(db.String(200))
    description = db.Column(db.Text)
    quantity = db.Column(db.Numeric(10, 2), default=0)
    unit = db.Column(db.String(20))
    unit_cost = db.Column(db.Numeric(10, 2), default=0)
    total_cost = db.Column(db.Numeric(12, 2), default=0)
    
    notes = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'material_type': self.material_type,
            'material_type_label': MATERIAL_LABELS.get(self.material_type, self.material_type),
            'material_name': self.material_name,
            'description': self.description,
            'quantity': float(self.quantity) if self.quantity else 0,
            'unit': self.unit,
            'unit_cost': float(self.unit_cost) if self.unit_cost else 0,
            'total_cost': float(self.total_cost) if self.total_cost else 0,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class OrderStatusHistory(db.Model):
    __tablename__ = 'order_status_history'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    status = db.Column(db.String(30), nullable=False)
    notes = db.Column(db.Text)
    changed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'status': self.status,
            'status_label': STATUS_LABELS.get(self.status, self.status),
            'notes': self.notes,
            'changed_at': self.changed_at.isoformat() if self.changed_at else None
        }
