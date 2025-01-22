## Project Structure
- `src/`: Frontend React application
- `backend/`: Python Flask backend

## Prerequisites
- Node.js
- npm
- Python 3.8+
- pip

## Setup and Running the Project

### Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start frontend development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows: venv\Scripts\activate
# On macOS/Linux: source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Start backend server
python app.py
```

## Running Both Frontend and Backend
1. Open two terminal windows
2. In first terminal, run frontend: `npm run dev`
3. In second terminal, run backend: `cd backend && python app.py`
