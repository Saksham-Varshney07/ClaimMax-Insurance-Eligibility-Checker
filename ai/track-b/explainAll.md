# System Explanation & Workflow

This document explains the purpose and logic behind every file in the ClaimMax Document Verification system (Track B).

## The Verification Workflow

1.  **START**: User runs `test.py` and provides an image path.
2.  **QR DECODE**: `card_validator/qr_scanner.py` parses the PMJAY identifier.
3.  **MRN CHECK**: `card_validator/mrn_validator.py` applies a checksum test to OCR'd IDs.
4.  **HOLOGRAM**: `card_validator/hologram_detector.py` uses HSV thresholding to find reflective security marks.
5.  **TAMPERING**: `tamper_detector/font_analyzer.py` calculates font size variance to spot Photoshop alterations.
6.  **SCORE**: `verify_pipeline.py` calculates final validity based on passes and penalties.
7.  **SAVE**: `test.py` writes the final data to `output/` with a timestamp.

---

## File-by-File Breakdown

### Core Verification Logic
- **`verify_pipeline.py`**: The Orchestrator. Connects all validators and computes the trust score.
- **`card_validator/qr_scanner.py`**: Locates and decodes the QR code for a valid Beneficiary ID.
- **`card_validator/mrn_validator.py`**: OCRs the card and validates the 12-digit MRN log.
- **`card_validator/hologram_detector.py`**: Detects authenticity artifacts like bright reflective spots.
- **`tamper_detector/font_analyzer.py`**: Identifies mismatched fonts indicating a composite or photoshopped image.

### Testing & Entry
- **`test.py`**: The main interface. Handles user input, logs the process, and handles output serialization.
- **`test_cards/`**: Contains mock verified and tampered card images.
- **`output/`**: Stores every verification result as a permanent JSON record.

### Documentation & Setup
- **`README.md`**: High-level project summary.
- **`RUN_GUIDE.md`**: Technical steps to get started.
- **`CHANGELOG.md`**: History of technical improvements.
- **`requirements.txt`**: List of Python libraries needed.

---

## Key Technologies
- **Tesseract OCR (v5)**: For reading textual elements on the card.
- **pyzbar**: QR code decoding engine.
- **OpenCV**: Powering the advanced image enhancement and hologram detection.
