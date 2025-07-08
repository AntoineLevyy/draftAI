#!/bin/bash

# TopDrawerSoccer Pennsylvania Player Scraper Runner
echo "Starting TopDrawerSoccer Pennsylvania Player Scraper..."
echo "=================================================="

# Check if virtual environment exists
if [ ! -d "scraper_env" ]; then
    echo "Creating virtual environment..."
    python3 -m venv scraper_env
fi

# Activate virtual environment
echo "Activating virtual environment..."
source scraper_env/bin/activate

# Install requirements if needed
echo "Checking dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# Run the scraper
echo "Running scraper..."
python3 working_scraper.py

echo "Done!" 