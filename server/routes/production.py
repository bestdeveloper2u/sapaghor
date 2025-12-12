from flask import request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from server.routes import api
from server.extensions import db
from server.models import ProductionTask, Equipment, Order

@api.route('/production-tasks', methods=['GET'])
@login_required
def get_production_tasks():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    task_type = request.args.get('task_type')
    
    query = ProductionTask.query
    
    if status:
        query = query.filter(ProductionTask.status == status)
    if task_type:
        query = query.filter(ProductionTask.task_type == task_type)
    
    tasks = query.order_by(ProductionTask.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'tasks': [t.to_dict() for t in tasks.items],
        'total': tasks.total,
        'pages': tasks.pages,
        'current_page': page
    })

@api.route('/production-tasks/<int:id>', methods=['GET'])
@login_required
def get_production_task(id):
    task = ProductionTask.query.get_or_404(id)
    return jsonify(task.to_dict())

@api.route('/production-tasks', methods=['POST'])
@login_required
def create_production_task():
    data = request.get_json()
    
    order = Order.query.get_or_404(data.get('order_id'))
    
    task = ProductionTask(
        order_id=order.id,
        task_type=data.get('task_type'),
        priority=data.get('priority', 'normal'),
        assigned_to=data.get('assigned_to'),
        equipment_id=data.get('equipment_id'),
        scheduled_start=datetime.fromisoformat(data.get('scheduled_start')) if data.get('scheduled_start') else None,
        scheduled_end=datetime.fromisoformat(data.get('scheduled_end')) if data.get('scheduled_end') else None
    )
    
    db.session.add(task)
    
    order.status = 'in_process'
    
    db.session.commit()
    return jsonify(task.to_dict()), 201

@api.route('/production-tasks/<int:id>', methods=['PUT'])
@login_required
def update_production_task(id):
    task = ProductionTask.query.get_or_404(id)
    data = request.get_json()
    
    task.task_type = data.get('task_type', task.task_type)
    task.status = data.get('status', task.status)
    task.priority = data.get('priority', task.priority)
    task.assigned_to = data.get('assigned_to', task.assigned_to)
    task.equipment_id = data.get('equipment_id', task.equipment_id)
    task.materials_used = data.get('materials_used', task.materials_used)
    task.wastage_notes = data.get('wastage_notes', task.wastage_notes)
    task.quality_notes = data.get('quality_notes', task.quality_notes)
    
    if data.get('status') == 'in_process' and not task.actual_start:
        task.actual_start = datetime.utcnow()
    
    if data.get('status') == 'completed':
        task.actual_end = datetime.utcnow()
        if task.actual_start:
            task.time_spent_minutes = int((task.actual_end - task.actual_start).total_seconds() / 60)
    
    order = task.order
    if data.get('status') == 'printing':
        order.status = 'printing'
    elif data.get('status') == 'binding':
        order.status = 'binding'
    elif data.get('status') == 'quality_check':
        order.status = 'quality_check'
    elif data.get('status') == 'completed':
        order.status = 'ready_for_delivery'
    
    db.session.commit()
    return jsonify(task.to_dict())

@api.route('/equipment', methods=['GET'])
@login_required
def get_equipment():
    equipment = Equipment.query.filter_by(status='available').all()
    return jsonify([e.to_dict() for e in equipment])

@api.route('/equipment', methods=['POST'])
@login_required
def create_equipment():
    data = request.get_json()
    
    equipment = Equipment(
        name=data.get('name'),
        equipment_type=data.get('equipment_type'),
        description=data.get('description'),
        location=data.get('location')
    )
    
    db.session.add(equipment)
    db.session.commit()
    
    return jsonify(equipment.to_dict()), 201

@api.route('/production-types', methods=['GET'])
@login_required
def get_production_types():
    return jsonify(['printing', 'binding', 'lamination', 'cutting', 'packing', 'other'])
