from datetime import datetime
from server.extensions import db

MATERIAL_TYPES = ['paper', 'ink', 'binding', 'pvc', 'sticker', 'consumable', 'other']
TRANSACTION_TYPES = ['stock_in', 'stock_out', 'adjustment', 'wastage']

class InventoryItem(db.Model):
    __tablename__ = 'inventory_items'
    
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(50), unique=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    
    category = db.Column(db.String(50))
    material_type = db.Column(db.String(50))
    
    unit = db.Column(db.String(20))
    current_stock = db.Column(db.Numeric(12, 2), default=0)
    minimum_stock = db.Column(db.Numeric(12, 2), default=0)
    reorder_level = db.Column(db.Numeric(12, 2), default=0)
    
    unit_cost = db.Column(db.Numeric(10, 2), default=0)
    selling_price = db.Column(db.Numeric(10, 2), default=0)
    
    supplier_name = db.Column(db.String(150))
    supplier_contact = db.Column(db.String(100))
    
    location = db.Column(db.String(100))
    notes = db.Column(db.Text)
    
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    transactions = db.relationship('InventoryTransaction', backref='item', lazy='dynamic')
    
    @property
    def is_low_stock(self):
        return float(self.current_stock or 0) <= float(self.minimum_stock or 0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'sku': self.sku,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'material_type': self.material_type,
            'unit': self.unit,
            'current_stock': float(self.current_stock) if self.current_stock else 0,
            'minimum_stock': float(self.minimum_stock) if self.minimum_stock else 0,
            'reorder_level': float(self.reorder_level) if self.reorder_level else 0,
            'unit_cost': float(self.unit_cost) if self.unit_cost else 0,
            'selling_price': float(self.selling_price) if self.selling_price else 0,
            'supplier_name': self.supplier_name,
            'is_low_stock': self.is_low_stock,
            'is_active': self.is_active
        }

class InventoryTransaction(db.Model):
    __tablename__ = 'inventory_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('inventory_items.id'), nullable=False)
    
    transaction_type = db.Column(db.String(30), nullable=False)
    quantity = db.Column(db.Numeric(12, 2), nullable=False)
    
    reference_type = db.Column(db.String(30))
    reference_id = db.Column(db.Integer)
    
    unit_cost = db.Column(db.Numeric(10, 2))
    total_cost = db.Column(db.Numeric(12, 2))
    
    notes = db.Column(db.Text)
    
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'item': self.item.to_dict() if self.item else None,
            'transaction_type': self.transaction_type,
            'quantity': float(self.quantity) if self.quantity else 0,
            'unit_cost': float(self.unit_cost) if self.unit_cost else 0,
            'total_cost': float(self.total_cost) if self.total_cost else 0,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
