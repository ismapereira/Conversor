from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Você precisará se registrar em https://www.exchangerate-api.com/ para obter uma API key
API_KEY = os.getenv('API_KEY')
BASE_URL = 'https://v6.exchangerate-api.com/v6'

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/currencies')
def get_currencies():
    try:
        response = requests.get(f'{BASE_URL}/{API_KEY}/codes')
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/convert', methods=['POST'])
def convert():
    try:
        data = request.json
        from_currency = data['from']
        to_currency = data['to']
        amount = float(data['amount'])

        response = requests.get(f'{BASE_URL}/{API_KEY}/pair/{from_currency}/{to_currency}/{amount}')
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
