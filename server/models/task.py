from datetime import datetime
from server.extensions import db

class EmployeeTask(db.Model):
    __tablename__ = 'employee_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    task_type = db.Column(db.String(50), nullable=False)  # design, production, delivery, etc.
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed, cancelled
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    due_date = db.Column(db.DateTime)
    estimated_hours = db.Column(db.Float)
    actual_hours = db.Column(db.Float)
    attachments = db.Column(db.JSON, default=[])
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    assigned_to = db.relationship('User', foreign_keys=[assigned_to_id], backref='assigned_tasks')
    assigned_by = db.relationship('User', foreign_keys=[assigned_by_id], backref='created_tasks')
    order = db.relationship('Order', backref='employee_tasks')
    
    def to_dict(self):
        return {
            'id': self.id,
            'assigned_to_id': self.assigned_to_id,
            'assigned_to': self.assigned_to.to_dict() if self.assigned_to else None,
            'assigned_by_id': self.assigned_by_id,
            'assigned_by': self.assigned_by.to_dict() if self.assigned_by else None,
            'order_id': self.order_id,
            'title': self.title,
            'description': self.description,
            'task_type': self.task_type,
            'status': self.status,
            'priority': self.priority,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'estimated_hours': self.estimated_hours,
            'actual_hours': self.actual_hours,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
        }
