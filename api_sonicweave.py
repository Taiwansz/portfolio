from flask import Blueprint, jsonify, request
from database import db
from models import SynthPreset, SynthRecording
import json
import os
import uuid
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'wav', 'mp3', 'ogg', 'webm'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

api_sonicweave_bp = Blueprint('api_sonicweave', __name__)

@api_sonicweave_bp.route('/api/sonicweave/presets', methods=['GET'])
def get_presets():
    presets = SynthPreset.query.all()
    result = []
    for p in presets:
        result.append({
            'id': p.id,
            'name': p.name,
            'settings': json.loads(p.settings_json),
            'created_at': p.created_at.isoformat()
        })
    return jsonify(result)

@api_sonicweave_bp.route('/api/sonicweave/presets', methods=['POST'])
def save_preset():
    data = request.get_json()
    if not data or 'settings' not in data:
        return jsonify({'error': 'Invalid payload, expected settings'}), 400
        
    name = data.get('name', 'Custom Preset')
    settings_data = json.dumps(data['settings'])
    
    preset = SynthPreset(name=name, settings_json=settings_data)
    db.session.add(preset)
    db.session.commit()
    
    return jsonify({'message': 'Preset saved', 'id': preset.id}), 201

@api_sonicweave_bp.route('/api/sonicweave/presets/<int:preset_id>', methods=['DELETE'])
def delete_preset(preset_id):
    preset = db.session.get(SynthPreset, preset_id)
    if not preset:
        return jsonify({'error': 'Preset not found'}), 404
        
    db.session.delete(preset)
    db.session.commit()
    return jsonify({'message': 'Preset deleted'})

@api_sonicweave_bp.route('/api/sonicweave/recordings', methods=['GET'])
def get_recordings():
    recordings = SynthRecording.query.order_by(SynthRecording.created_at.desc()).all()
    result = []
    for r in recordings:
        result.append({
            'id': r.id,
            'name': r.name,
            'filepath': r.filepath,
            'created_at': r.created_at.isoformat()
        })
    return jsonify(result)

@api_sonicweave_bp.route('/api/sonicweave/recordings', methods=['POST'])
def save_recording():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
        
    audio_file = request.files['audio']
    name = request.form.get('name', 'Untitled Recording')
    
    if audio_file.filename == '':
        return jsonify({'error': 'No audio file selected'}), 400
        
    if not allowed_file(audio_file.filename):
        return jsonify({'error': 'Invalid file type. Only WAV, MP3, OGG, WEBM allowed.'}), 400
        
    # Create directory if not exists
    upload_folder = os.path.join(os.getcwd(), 'static', 'uploads', 'recordings')
    os.makedirs(upload_folder, exist_ok=True)
    
    # Save file with unique name
    ext = audio_file.filename.rsplit('.', 1)[1].lower()
    unique_filename = secure_filename(f"{uuid.uuid4().hex}.{ext}")
    filepath = os.path.join(upload_folder, unique_filename)
    audio_file.save(filepath)
    
    # Save to db with relative path
    relative_path = f"/static/uploads/recordings/{unique_filename}"
    recording = SynthRecording(name=name, filepath=relative_path)
    db.session.add(recording)
    db.session.commit()
    
    return jsonify({'message': 'Recording saved', 'id': recording.id, 'filepath': relative_path}), 201
