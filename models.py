from database import db
from datetime import datetime, timezone

# --- TaskFlow Models ---
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='todo') # todo, in_progress, done
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

# --- CryptoVision Models ---
class PortfolioItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    coin_id = db.Column(db.String(50), nullable=False) # e.g. 'bitcoin'
    amount = db.Column(db.Float, nullable=False)
    buy_price = db.Column(db.Float, nullable=False)
    added_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

# --- AuraWeather Models ---
class FavoriteCity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    added_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

# --- OmniFlow Models ---
class OmniWorkflow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, default="Untitled Workflow")
    nodes_json = db.Column(db.Text, nullable=False, default="[]") # Stores nodes and connections
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

# --- SonicWeave Models ---
class SynthPreset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, default="Custom Preset")
    settings_json = db.Column(db.Text, nullable=False, default="{}") # Stores knob states, waveforms
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class SynthRecording(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, default="Untitled Recording")
    filepath = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
