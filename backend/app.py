from flask import Flask, render_template, request, jsonify
import pyttsx3
import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
import easyocr
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from PIL import Image
import io
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Download stopwords
nltk.download('stopwords')

# Load dataset and clean only the 'Prompt' column
try:
    df = pd.read_csv("backend/Doj_data.csv", encoding='latin1')
    df.drop_duplicates(inplace=True)
    df['Prompt'] = df['Prompt'].fillna('')
    df['Response'] = df['Response'].fillna('')
except FileNotFoundError:
    raise FileNotFoundError("Error: 'Doj_data.csv' file not found. Please ensure it is in the correct location.")

# Define stop words set for cleaning
stop_words = set(stopwords.words("english"))

# Clean text function
def clean_text(text):
    if not isinstance(text, str):  # Check if text is a string
        return ''  # Return empty string for non-string inputs
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return ' '.join(word for word in text.split() if word not in stop_words)

# Apply cleaning to the 'Prompt' column
df['Cleaned_Prompt'] = df['Prompt'].apply(clean_text)

# Load pre-trained SentenceTransformer model for semantic similarity
model = SentenceTransformer('all-MiniLM-L6-v2')

# Embed all cleaned prompts in the dataset
query_embeddings = model.encode(df['Cleaned_Prompt'].tolist())

# Initialize easyocr Reader
reader = easyocr.Reader(['en'])

def get_response(user_query):
    try:
        # Clean and encode the user query
        cleaned_query = clean_text(user_query)
        user_embedding = model.encode([cleaned_query])
        
        # Calculate semantic similarity with cosine similarity
        similarities = cosine_similarity(user_embedding, query_embeddings)
        best_match_index = similarities.argmax()
        
        # Check if similarity is above a certain threshold
        if similarities[0][best_match_index] > 0.5:  # Set threshold for accuracy
            return df.iloc[best_match_index]['Response']  # Return the original response
        else:
            return "I'm sorry, I couldn't find relevant information related to that query."
    except Exception as e:
        print(f"Error in get_response: {e}")
        return "An error occurred while processing your query."

# Function to extract text from an uploaded image
def extract_text_from_image(image_data):
    try:
        image = Image.open(io.BytesIO(image_data))
        result = reader.readtext(np.array(image))
        text = ' '.join([res[1] for res in result])
        return text
    except Exception as e:
        print(f"Error in extract_text_from_image: {e}")
        return "Error in extracting text from the image."

# Define the chat route to handle user queries
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if 'query' not in data:
            return jsonify({'error': 'Missing "query" in request data'}), 400
        
        user_input = data['query']
        response = get_response(user_input)
        
        return jsonify({
            'response': response
        })
    except Exception as e:
        print(f"Error in chat route: {e}")
        return jsonify({'error': str(e)}), 500

# Define a route to handle image uploads
@app.route('/upload_image', methods=['POST'])
def upload_image():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'})

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'})

        # Read the uploaded image and extract text
        image_data = file.read()
        extracted_text = extract_text_from_image(image_data)

        # Get response based on extracted text
        response = get_response(extracted_text)
        return jsonify({'response': response})
    except Exception as e:
        print(f"Error in upload_image route: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)