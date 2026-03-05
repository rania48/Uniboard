const API_URL = 'http://127.0.0.1:5000/api';

const api = {
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // Handle JWT standard 'msg' field if 'error' is missing
            if (!result.message && !result.error && result.msg) {
                result.error = result.msg;
            }

            return result;
        } catch (error) {
            console.error('API Post Error:', error);
            return { error: 'Erreur de communication avec le serveur. Vérifiez la connexion.' };
        }
    },

    async get(endpoint) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
                }
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { error: 'Une erreur est survenue lors de la communication avec le serveur.' };
        }
    }
};
