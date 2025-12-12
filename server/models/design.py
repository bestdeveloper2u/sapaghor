from datetime import datetime
from server.extensions import db

DESIGN_STATUS = ['pending', 'in_progress', 'proof_sent', 'revision_requested', 'approved', 'completed']

class DesignTask(db.Model):
    __tablename__ = 'design_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    designer_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    status = db.Column(db.String(30), default='pending')
    priority = db.Column(db.String(20), default='normal')
    
    design_requirements = db.Column(db.Text)
    reference_files = db.Column(db.JSON, default=[])
    
    assigned_at = db.Column(db.DateTime)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    deadline = db.Column(db.DateTime)
    
    revision_count = db.Column(db.Integer, default=0)
    feedback = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    proofs = db.relationship('DesignProof', backref='design_task', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'designer': self.designer.to_dict() if self.designer else None,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'design_requirements': self.design_requirements,
            'reference_files': self.reference_files,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'revision_count': self.revision_count,
            'feedback': self.feedback,
            'proofs': [proof.to_dict() for proof in self.proofs],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class DesignProof(db.Model):
    __tablename__ = 'design_proofs'
    
    id = db.Column(db.Integer, primary_key=True)
    design_task_id = db.Column(db.Integer, db.ForeignKey('design_tasks.id'), nullable=False)
    
    version = db.Column(db.Integer, default=1)
    file_path = db.Column(db.String(500))
    file_name = db.Column(db.String(200))
    
    status = db.Column(db.String(30), default='pending')
    client_feedback = db.Column(db.Text)
    internal_notes = db.Column(db.Text)
    
    sent_at = db.Column(db.DateTime)
    reviewed_at = db.Column(db.DateTime)
    approved_at = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'version': self.version,
            'file_path': self.file_path,
            'file_name': self.file_name,
            'status': self.status,
            'client_feedback': self.client_feedback,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None
        }
