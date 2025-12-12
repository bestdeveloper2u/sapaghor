from datetime import datetime
from server.extensions import db

class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(200), nullable=False)
    contact_person = db.Column(db.String(150))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    alternate_phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    city = db.Column(db.String(100))
    district = db.Column(db.String(100))
    category = db.Column(db.String(50))
    credit_limit = db.Column(db.Numeric(12, 2), default=0)
    outstanding_balance = db.Column(db.Numeric(12, 2), default=0)
    notes = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    orders = db.relationship('Order', backref='customer', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_name': self.company_name,
            'contact_person': self.contact_person,
            'email': self.email,
            'phone': self.phone,
            'alternate_phone': self.alternate_phone,
            'address': self.address,
            'city': self.city,
            'district': self.district,
            'category': self.category,
            'credit_limit': float(self.credit_limit) if self.credit_limit else 0,
            'outstanding_balance': float(self.outstanding_balance) if self.outstanding_balance else 0,
            'notes': self.notes,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'total_orders': self.orders.count() if self.orders else 0
        }
