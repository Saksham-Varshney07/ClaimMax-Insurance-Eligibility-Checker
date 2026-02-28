# ClaimMax Document Verification (Person B Track)

## Overview
Card photo -> Trust score. 
This system uses OpenCV, pyzbar, and Tesseract to extract card features, decode QR codes, detect holograms, and analyze fonts to predict the authenticity of a PMJAY card.

## Quick Start
1. **Setup**
   ```bash
   cd ai/track-b
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

2. **Run Test**
   ```bash
   python test.py
   ```
   *Follow the prompt to enter your image path (e.g., test_cards/real1.jpg).*

## Output
Results are saved as `cardname-timestamp.json` in the `output/` directory.

## Requirements
- Python 3.8+
- Tesseract OCR Engine (System Install)
- OpenCV, Pytesseract, Pillow, pyzbar

See [explainAll.md](explainAll.md) for a deep dive into the architecture.
