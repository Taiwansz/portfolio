from flask import Blueprint, jsonify, request
from database import db
from models import OmniWorkflow
import json

api_omniflow_bp = Blueprint('api_omniflow', __name__)

@api_omniflow_bp.route('/api/omniflow', methods=['GET'])
def get_workflows():
    workflows = OmniWorkflow.query.all()
    result = []
    for wf in workflows:
        result.append({
            'id': wf.id,
            'name': wf.name,
            'nodes_json': json.loads(wf.nodes_json),
            'updated_at': wf.updated_at.isoformat()
        })
    return jsonify(result)

@api_omniflow_bp.route('/api/omniflow', methods=['POST'])
def save_workflow():
    data = request.get_json()
    if not data or 'nodes_json' not in data:
        return jsonify({'error': 'Invalid payload, expected nodes_json'}), 400
        
    wf_id = data.get('id')
    nodes_data = json.dumps(data['nodes_json'])
    name = data.get('name', 'Untitled Workflow')
    
    if wf_id:
        wf = db.session.get(OmniWorkflow, wf_id)
        if wf:
            wf.name = name
            wf.nodes_json = nodes_data
            db.session.commit()
            return jsonify({'message': 'Workflow updated', 'id': wf.id})
            
    # Create new
    wf = OmniWorkflow(name=name, nodes_json=nodes_data)
    db.session.add(wf)
    db.session.commit()
    return jsonify({'message': 'Workflow created', 'id': wf.id}), 201

@api_omniflow_bp.route('/api/omniflow/<int:wf_id>', methods=['DELETE'])
def delete_workflow(wf_id):
    wf = db.session.get(OmniWorkflow, wf_id)
    if not wf:
        return jsonify({'error': 'Workflow not found'}), 404
        
    db.session.delete(wf)
    db.session.commit()
    return jsonify({'message': 'Workflow deleted'})
