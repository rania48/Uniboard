from flask import jsonify

def register_error_handlers(app):
    @app.errorhandler(404)
    def handle_404(e):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def handle_500(e):
        return jsonify({'error': 'Internal server error'}), 500

    @app.errorhandler(401)
    def handle_401(e):
        return jsonify({'error': 'Unauthorized'}), 401
    
    @app.errorhandler(403)
    def handle_403(e):
        return jsonify({'error': 'Forbidden'}), 403
