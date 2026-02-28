# RUN GUIDE

## 1. Prerequisites
- **Install Tesseract OCR**: Download from UB-Mannheim
- **Configure Path**: Ensure Tesseract is in system PATH or configured.

## 2. Environment Setup
```bash
cd ai/track-b
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## 3. Running Verification
Run the interactive tester:
```bash
python test.py
```
When prompted, enter the path to a card image:
- `test_cards/real1.jpg`
- `test_cards/fake1.jpg`

## 4. Viewing Results
Check the `output/` folder for timestamped JSON files. Each file contains:
- `validity`: Overall trust score from 0.0 to 1.0
- `qr_valid`: Boolean indicating QR scan success
- `mrn_valid`: Boolean indicating MRN checksum success
- `issues`: List of tampering flags detected
