export interface ClassificationResult {
    is_cognizable: boolean;
    offence_category: string;
    bns_sections: string[];
    section_names: string[];
    punishment_range: string;
    fir_mandatory: boolean;
    confidence: number;
    clarifying_question: string | null;
    non_cognizable_advice: string | null;
    missing_details: string[];
}

export interface FIREnglish {
    title: string;
    legal_basis: string;
    date_of_complaint: string;
    police_station: string;
    district: string;
    complainant_name: string;
    complainant_address: string;
    complainant_phone: string;
    date_of_incident: string;
    time_of_incident: string;
    place_of_incident: string;
    accused_name: string;
    accused_description: string;
    witnesses: string;
    stolen_property_or_evidence: string;
    incident_description: string;
    applicable_sections: string[];
    prayer: string;
    legal_rights_note: string;
}

export interface FIRHindiSummary {
    incident_summary_hi: string;
    prayer_hi: string;
    rights_hi: string;
}

export interface FIRData {
    fir_english: FIREnglish;
    fir_hindi_summary: FIRHindiSummary;
    form_fields_to_fill: string[];
}

export interface EscalationDocument {
    title: string;
    legal_basis: string;
    addressed_to: string;
    subject: string;
    body: string;
    prayer?: string;
    closing: string;
    delivery_method: string;
}

export interface EscalationDocs {
    document_1_sho_complaint: EscalationDocument;
    document_2_sp_complaint: EscalationDocument;
    document_3_magistrate_application: EscalationDocument;
    escalation_summary: {
        step_1: string;
        step_2: string;
        step_3: string;
        important_note: string;
    };
}
