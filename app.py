from flask import Flask, render_template
from database import db
from api_taskflow import taskflow_bp
from api_crypto import crypto_bp
from api_weather import weather_bp
from api_omniflow import api_omniflow_bp
from api_sonicweave import api_sonicweave_bp

import os
from dotenv import load_dotenv
from flask_talisman import Talisman
from extensions import limiter

load_dotenv()

app = Flask(__name__)
# Ensure the instance folder exists
os.makedirs(app.instance_path, exist_ok=True)

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', os.urandom(24))
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max upload
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
limiter.init_app(app)
Talisman(app, content_security_policy=None, force_https=False)

with app.app_context():
    import models
    db.create_all()

app.register_blueprint(taskflow_bp)
app.register_blueprint(crypto_bp)
app.register_blueprint(weather_bp)
app.register_blueprint(api_omniflow_bp)
app.register_blueprint(api_sonicweave_bp)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/sobre')
def sobre():
    return render_template('sobre.html')

@app.route('/projetos')
def projetos():
    return render_template('projetos.html')

@app.route('/portfolio')
def portfolio():
    return render_template('portfolio.html')

@app.route('/projetos/taskflow')
def taskflow():
    return render_template('projetos/taskflow.html')

@app.route('/projetos/taskflow/app')
def taskflow_app():
    return render_template('projetos/taskflow_app.html')

@app.route('/projetos/cryptovision')
def cryptovision():
    return render_template('projetos/cryptovision.html')

@app.route('/projetos/cryptovision/app')
def cryptovision_app():
    return render_template('projetos/cryptovision_app.html')

@app.route('/projetos/auraweather')
def auraweather():
    return render_template('projetos/auraweather.html')

@app.route('/projetos/auraweather/app')
def auraweather_app():
    return render_template('projetos/auraweather_app.html')

@app.route('/projetos/omniflow')
def omniflow():
    return render_template('projetos/omniflow.html')

@app.route('/projetos/omniflow/app')
def omniflow_app():
    return render_template('projetos/omniflow_app.html')

@app.route('/projetos/omniflow/galeria')
def omniflow_galeria():
    return render_template('projetos/omniflow_galeria.html')

@app.route('/projetos/sonicweave')
def sonicweave():
    return render_template('projetos/sonicweave.html')

@app.route('/projetos/sonicweave/app')
def sonicweave_app():
    return render_template('projetos/sonicweave_app.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
