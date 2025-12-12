from datetime import datetime
from server.extensions import db

PRODUCTION_STATUS = ['pending', 'in_process', 'printing', 'binding', 'quality_check', 'completed', 'on_hold']

class Equipment(db.Model):
    __tablename__ = 'equipment'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    equipment_type = db.Column(db.String(50))
    description = db.Column(db.Text)
    status = db.Column(db.String(30), default='available')
    location = db.Column(db.String(100))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'equipment_type': self.equipment_type,
            'description': self.description,
            'status': self.status,
            'location': self.location
        }

class ProductionTask(db.Model):
    __tablename__ = 'production_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    
    task_type = db.Column(db.String(50))
    status = db.Column(db.String(30), default='pending')
    priority = db.Column(db.String(20), default='normal')
    
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.id'))
    
    materials_used = db.Column(db.JSON, default=[])
    wastage_notes = db.Column(db.Text)
    quality_notes = db.Column(db.Text)
    
    scheduled_start = db.Column(db.DateTime)
    actual_start = db.Column(db.DateTime)
    scheduled_end = db.Column(db.DateTime)
    actual_end = db.Column(db.DateTime)
    
    time_spent_minutes = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    equipment = db.relationship('Equipment', backref='production_tasks')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'task_type': self.task_type,
            'status': self.status,
            'priority': self.priority,
            'equipment': self.equipment.to_dict() if self.equipment else None,
            'materials_used': self.materials_used,
            'scheduled_start': self.scheduled_start.isoformat() if self.scheduled_start else None,
            'actual_start': self.actual_start.isoformat() if self.actual_start else None,
            'time_spent_minutes': self.time_spent_minutes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
