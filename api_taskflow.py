from flask import Blueprint, jsonify, request
from models import Task
from database import db

taskflow_bp = Blueprint('taskflow_bp', __name__)

@taskflow_bp.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([{'id': t.id, 'title': t.title, 'description': t.description, 'status': t.status} for t in tasks])

@taskflow_bp.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    new_task = Task(title=data['title'], description=data.get('description'), status=data.get('status', 'todo'))
    db.session.add(new_task)
    db.session.commit()
    return jsonify({'id': new_task.id, 'title': new_task.title, 'description': new_task.description, 'status': new_task.status})

@taskflow_bp.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.json
    if 'status' in data:
        task.status = data['status']
    if 'description' in data:
        task.description = data['description']
    db.session.commit()
    return jsonify({'id': task.id, 'title': task.title, 'description': task.description, 'status': task.status})
