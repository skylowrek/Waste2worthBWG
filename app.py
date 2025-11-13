from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_socketio import SocketIO, emit, join_room, leave_room
import bcrypt
from datetime import datetime, timedelta
import logging

from config import Config
from database import db
from routes.auth import auth_bp
from routes.listings import listings_bp
from routes.waste_streams import waste_streams_bp
from routes.sourcing_profiles import sourcing_profiles_bp
from routes.offers import offers_bp
from routes.negotiations import negotiations_bp
from routes.alerts import alerts_bp
from routes.transactions import transactions_bp
from routes.stats import stats_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins=Config.CORS_ORIGINS)

# Connect to database
try:
    db.connect()
    logger.info("🌱 Waste2Worth Backend Starting...")
except Exception as e:
    logger.error(f"Failed to connect to database: {e}")
    exit(1)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(listings_bp, url_prefix='/api/listings')
app.register_blueprint(waste_streams_bp, url_prefix='/api/waste-streams')
app.register_blueprint(sourcing_profiles_bp, url_prefix='/api/sourcing-profiles')
app.register_blueprint(offers_bp, url_prefix='/api/offers')
app.register_blueprint(negotiations_bp, url_prefix='/api/negotiations')
app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
app.register_blueprint(stats_bp, url_prefix='/api/stats')

# Root endpoint
@app.route('/')
def index():
    return jsonify({
        'message': '🌱 Welcome to Waste2Worth API',
        'version': '1.0.0',
        'status': 'active',
        'endpoints': {
            'auth': '/api/auth',
            'listings': '/api/listings',
            'waste_streams': '/api/waste-streams',
            'sourcing_profiles': '/api/sourcing-profiles',
            'offers': '/api/offers',
            'negotiations': '/api/negotiations',
            'alerts': '/api/alerts',
            'transactions': '/api/transactions',
            'stats': '/api/stats'
        }
    })

# Health check
@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

# WebSocket events for real-time chat
@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to Waste2Worth chat server'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('join_negotiation')
def handle_join_negotiation(data):
    negotiation_id = data.get('negotiation_id')
    join_room(f"negotiation_{negotiation_id}")
    logger.info(f"User joined negotiation room: {negotiation_id}")
    emit('joined_negotiation', {'negotiation_id': negotiation_id})

@socketio.on('leave_negotiation')
def handle_leave_negotiation(data):
    negotiation_id = data.get('negotiation_id')
    leave_room(f"negotiation_{negotiation_id}")
    logger.info(f"User left negotiation room: {negotiation_id}")

@socketio.on('send_message')
def handle_send_message(data):
    negotiation_id = data.get('negotiation_id')
    sender_id = data.get('sender_id')
    message_text = data.get('message')
    
    # Save message to database
    query = """
        INSERT INTO messages (negotiation_id, sender_id, message_text, created_at)
        VALUES (%s, %s, %s, NOW())
    """
    message_id = db.execute_query(query, (negotiation_id, sender_id, message_text))
    
    # Get sender name
    user_query = "SELECT name FROM users WHERE id = %s"
    user = db.fetch_one(user_query, (sender_id,))
    
    # Broadcast to negotiation room
    emit('new_message', {
        'id': message_id,
        'negotiation_id': negotiation_id,
        'sender_id': sender_id,
        'sender_name': user['name'] if user else 'Unknown',
        'message': message_text,
        'timestamp': datetime.now().isoformat()
    }, room=f"negotiation_{negotiation_id}")

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 401

# Cleanup on shutdown
@app.teardown_appcontext
def shutdown_session(exception=None):
    db.close()

if __name__ == '__main__':
    logger.info(f"✅ Waste2Worth Backend running on http://{Config.HOST}:{Config.PORT}")
    socketio.run(app, host=Config.HOST, port=Config.PORT, debug=True)
