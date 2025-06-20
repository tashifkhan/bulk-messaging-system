#!/bin/bash

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

echo "Python backend setup complete!"
echo "To start the server:"
echo "1. source venv/bin/activate"
echo "2. python app.py"
