# Backend Setup Instructions

## Project Dependencies
- Flask
- pyttsx3
- pandas
- nltk
- easyocr
- scikit-learn
- sentence-transformers

## Setup Steps
1. Ensure you're in the project root
2. Navigate to backend folder: `cd backend`
3. Create Python virtual environment: `python -m venv venv`
4. Activate virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
5. Install dependencies: `pip install -r requirements.txt`
6. Place your `Doj_data.csv` in this directory
7. Run the Flask server: `python app.py`

## API Endpoints
- Base URL: `http://127.0.0.1:5000`
- Endpoints will be documented here as they are developed