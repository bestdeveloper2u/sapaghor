from flask import request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from server.routes import api
from server.extensions import db
from server.models import DesignTask, DesignProof, Order, User

@api.route('/design-tasks', methods=['GET'])
@login_required
def get_design_tasks():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    designer_id = request.args.get('designer_id', type=int)
    
    query = DesignTask.query
    
    if status:
        query = query.filter(DesignTask.status == status)
    if designer_id:
        query = query.filter(DesignTask.designer_id == designer_id)
    
    tasks = query.order_by(DesignTask.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'tasks': [t.to_dict() for t in tasks.items],
        'total': tasks.total,
        'pages': tasks.pages,
        'current_page': page
    })

@api.route('/design-tasks/<int:id>', methods=['GET'])
@login_required
def get_design_task(id):
    task = DesignTask.query.get_or_404(id)
    return jsonify(task.to_dict())

@api.route('/design-tasks', methods=['POST'])
@login_required
def create_design_task():
    data = request.get_json()
    
    order = Order.query.get_or_404(data.get('order_id'))
    
    task = DesignTask(
        order_id=order.id,
        designer_id=data.get('designer_id'),
        title=data.get('title'),
        description=data.get('description'),
        design_requirements=data.get('design_requirements'),
        priority=data.get('priority', 'normal'),
        deadline=datetime.fromisoformat(data.get('deadline')) if data.get('deadline') else None
    )
    
    if data.get('designer_id'):
        task.assigned_at = datetime.utcnow()
        task.status = 'pending'
        order.status = 'designer_assigned'
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify(task.to_dict()), 201

@api.route('/design-tasks/<int:id>', methods=['PUT'])
@login_required
def update_design_task(id):
    task = DesignTask.query.get_or_404(id)
    data = request.get_json()
    
    task.designer_id = data.get('designer_id', task.designer_id)
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.design_requirements = data.get('design_requirements', task.design_requirements)
    task.priority = data.get('priority', task.priority)
    task.status = data.get('status', task.status)
    task.feedback = data.get('feedback', task.feedback)
    
    if data.get('status') == 'in_progress' and not task.started_at:
        task.started_at = datetime.utcnow()
    
    if data.get('status') == 'completed':
        task.completed_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(task.to_dict())

@api.route('/design-tasks/<int:id>/proofs', methods=['POST'])
@login_required
def create_design_proof(id):
    task = DesignTask.query.get_or_404(id)
    data = request.get_json()
    
    last_proof = DesignProof.query.filter_by(design_task_id=id).order_by(DesignProof.version.desc()).first()
    version = (last_proof.version + 1) if last_proof else 1
    
    proof = DesignProof(
        design_task_id=id,
        version=version,
        file_path=data.get('file_path'),
        file_name=data.get('file_name'),
        internal_notes=data.get('internal_notes')
    )
    
    db.session.add(proof)
    
    task.status = 'proof_sent'
    proof.sent_at = datetime.utcnow()
    
    order = task.order
    order.status = 'proof_sent'
    
    db.session.commit()
    return jsonify(proof.to_dict()), 201

@api.route('/design-proofs/<int:id>/review', methods=['PUT'])
@login_required
def review_design_proof(id):
    proof = DesignProof.query.get_or_404(id)
    data = request.get_json()
    
    action = data.get('action')
    feedback = data.get('feedback', '')
    
    proof.client_feedback = feedback
    proof.reviewed_at = datetime.utcnow()
    
    task = proof.design_task
    order = task.order
    
    if action == 'approve':
        proof.status = 'approved'
        proof.approved_at = datetime.utcnow()
        task.status = 'approved'
        order.status = 'proof_confirmed'
    else:
        proof.status = 'revision_requested'
        task.status = 'revision_requested'
        task.revision_count += 1
        task.feedback = feedback
    
    db.session.commit()
    return jsonify(proof.to_dict())

@api.route('/designers', methods=['GET'])
@login_required
def get_designers():
    from server.models import Role
    designer_role = Role.query.filter_by(name='Designer').first()
    if designer_role:
        designers = User.query.filter_by(role_id=designer_role.id, is_active=True).all()
    else:
        designers = User.query.filter_by(department='Design', is_active=True).all()
    return jsonify([d.to_dict() for d in designers])
