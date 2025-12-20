from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from server.extensions import db
from server.models.task import EmployeeTask
from datetime import datetime

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

@tasks_bp.route('', methods=['GET'])
@login_required
def list_tasks():
    status = request.args.get('status')
    priority = request.args.get('priority')
    
    query = EmployeeTask.query.filter_by(assigned_to_id=current_user.id)
    
    if status:
        query = query.filter_by(status=status)
    if priority:
        query = query.filter_by(priority=priority)
    
    tasks = query.order_by(EmployeeTask.due_date).all()
    
    return jsonify({
        'tasks': [t.to_dict() for t in tasks]
    })

@tasks_bp.route('/<int:task_id>', methods=['GET'])
@login_required
def get_task(task_id):
    task = EmployeeTask.query.get_or_404(task_id)
    
    if task.assigned_to_id != current_user.id and task.assigned_by_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(task.to_dict())

@tasks_bp.route('/<int:task_id>', methods=['PATCH'])
@login_required
def update_task(task_id):
    task = EmployeeTask.query.get_or_404(task_id)
    
    if task.assigned_to_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'status' in data:
        task.status = data['status']
        if data['status'] == 'completed':
            task.completed_at = datetime.utcnow()
    
    if 'actual_hours' in data:
        task.actual_hours = data['actual_hours']
    
    if 'notes' in data:
        task.notes = data['notes']
    
    db.session.commit()
    return jsonify(task.to_dict())

@tasks_bp.route('', methods=['POST'])
@login_required
def create_task():
    data = request.get_json()
    
    task = EmployeeTask(
        assigned_to_id=data.get('assigned_to_id'),
        assigned_by_id=current_user.id,
        order_id=data.get('order_id'),
        title=data.get('title'),
        description=data.get('description'),
        task_type=data.get('task_type'),
        priority=data.get('priority', 'medium'),
        due_date=datetime.fromisoformat(data.get('due_date')) if data.get('due_date') else None,
        estimated_hours=data.get('estimated_hours')
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify(task.to_dict()), 201

@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    task = EmployeeTask.query.get_or_404(task_id)
    
    if task.assigned_by_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'message': 'Task deleted'})
