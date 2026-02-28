# Implementation Details

## Verification Pipeline Architecture
1. **Interactive Entry** (`test.py`): Handles user input and timestamped file naming.
2. **QR Decoder** (`card_validator/qr_scanner.py`): Parses the PMJAY identifier from the QR code.
3. **MRN Validator** (`card_validator/mrn_validator.py`): Applies a checksum test to OCR'd IDs.
4. **Hologram Detector** (`card_validator/hologram_detector.py`): Uses HSV thresholding to find reflective security marks.
5. **Font Analyzer** (`tamper_detector/font_analyzer.py`): Calculates font size variance to spot Photoshop alterations.
6. **Main Pipeline** (`verify_pipeline.py`): Orchestrates checks and compiles final validity score.

## Recent Updates
- **Interactive CLI**: Replaced demo script with `test.py` for better user experience.
- **Timestamped JSON**: Results now saved as `filename-timestamp.json` to prevent overwrites.
