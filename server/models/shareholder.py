from datetime import datetime
from server.extensions import db
from decimal import Decimal

class Shareholder(db.Model):
    __tablename__ = 'shareholders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    share_percentage = db.Column(db.Numeric(5, 2), default=0, nullable=False)  # 0-100
    share_amount = db.Column(db.Numeric(15, 2), default=0, nullable=False)
    invested_amount = db.Column(db.Numeric(15, 2), default=0, nullable=False)
    profit_earned = db.Column(db.Numeric(15, 2), default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', backref='shareholder_profile', lazy='joined')
    profit_history = db.relationship('ShareholderProfit', backref='shareholder', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user': self.user.to_dict() if self.user else None,
            'share_percentage': float(self.share_percentage),
            'share_amount': float(self.share_amount),
            'invested_amount': float(self.invested_amount),
            'profit_earned': float(self.profit_earned),
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class ShareholderProfit(db.Model):
    __tablename__ = 'shareholder_profits'
    
    id = db.Column(db.Integer, primary_key=True)
    shareholder_id = db.Column(db.Integer, db.ForeignKey('shareholders.id'), nullable=False)
    profit_amount = db.Column(db.Numeric(15, 2), nullable=False)
    period_start = db.Column(db.DateTime, nullable=False)
    period_end = db.Column(db.DateTime, nullable=False)
    payment_status = db.Column(db.String(20), default='pending')  # pending, paid
    paid_date = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'shareholder_id': self.shareholder_id,
            'profit_amount': float(self.profit_amount),
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'period_end': self.period_end.isoformat() if self.period_end else None,
            'payment_status': self.payment_status,
            'paid_date': self.paid_date.isoformat() if self.paid_date else None,
            'notes': self.notes,
        }
