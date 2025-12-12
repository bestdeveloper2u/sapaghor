from datetime import datetime
from server.extensions import db

DELIVERY_STATUS = ['scheduled', 'out_for_delivery', 'delivered', 'failed', 'rescheduled']

class Delivery(db.Model):
    __tablename__ = 'deliveries'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    
    delivery_person_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    delivery_address = db.Column(db.Text)
    contact_phone = db.Column(db.String(20))
    
    scheduled_date = db.Column(db.DateTime)
    actual_delivery_date = db.Column(db.DateTime)
    
    status = db.Column(db.String(30), default='scheduled')
    
    recipient_name = db.Column(db.String(150))
    recipient_signature = db.Column(db.Text)
    delivery_photo = db.Column(db.String(500))
    
    notes = db.Column(db.Text)
    customer_feedback = db.Column(db.Text)
    rating = db.Column(db.Integer)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'delivery_person': self.delivery_person.to_dict() if self.delivery_person else None,
            'delivery_address': self.delivery_address,
            'contact_phone': self.contact_phone,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'actual_delivery_date': self.actual_delivery_date.isoformat() if self.actual_delivery_date else None,
            'status': self.status,
            'recipient_name': self.recipient_name,
            'customer_feedback': self.customer_feedback,
            'rating': self.rating,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
