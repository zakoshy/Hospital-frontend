export const TEST_TEMPLATES = {
  "Full Hemogram": [
    { field: "Hemoglobin", type: "number", unit: "g/dL" },
    { field: "WBC Count", type: "number", unit: "x10^9/L" },
    { field: "Platelets", type: "number", unit: "x10^9/L" },
  ],
  "Malaria Test": [
    { field: "Result", type: "select", options: ["Positive", "Negative"] },
    { field: "Parasite Load", type: "number", unit: "parasites/μL" },
  ],
  "Blood Sugar": [
    { field: "Blood Sugar Level", type: "number", unit: "mmol/L" },
  ],
  "Urinalysis": [
    { field: "Color", type: "text" },
    { field: "Specific Gravity", type: "number" },
    { field: "Protein", type: "text" },
  ],
  "TFT": [
    { field: "TSH", type: "number", unit: "μIU/mL" },
    { field: "T3", type: "number", unit: "ng/dL" },
    { field: "T4", type: "number", unit: "μg/dL" },
  ],
  "Liver Function Test": [
    { field: "ALT", type: "number", unit: "U/L" },
    { field: "AST", type: "number", unit: "U/L" },
    { field: "Bilirubin Total", type: "number", unit: "mg/dL" },
    { field: "Bilirubin Direct", type: "number", unit: "mg/dL" },
  ],
  "Renal Profile": [
    { field: "Creatinine", type: "number", unit: "mg/dL" },
    { field: "BUN", type: "number", unit: "mg/dL" },
    { field: "Sodium", type: "number", unit: "mmol/L" },
    { field: "Potassium", type: "number", unit: "mmol/L" },
  ],
  "Lipid Profile": [
    { field: "Total Cholesterol", type: "number", unit: "mg/dL" },
    { field: "HDL", type: "number", unit: "mg/dL" },
    { field: "LDL", type: "number", unit: "mg/dL" },
    { field: "Triglycerides", type: "number", unit: "mg/dL" },
  ],
  "HIV Test": [
    { field: "Result", type: "select", options: ["Positive", "Negative", "Indeterminate"] },
  ],
  "Pregnancy Test": [
    { field: "Result", type: "select", options: ["Positive", "Negative"] },
  ],
  "COVID-19 PCR": [
    { field: "Result", type: "select", options: ["Positive", "Negative"] },
    { field: "Ct Value", type: "number" },
  ],
  "Stool Microscopy": [
    { field: "Consistency", type: "text" },
    { field: "Parasites Seen", type: "text" },
    { field: "Occult Blood", type: "select", options: ["Positive", "Negative"] },
  ],
  "Electrolytes": [
    { field: "Sodium", type: "number", unit: "mmol/L" },
    { field: "Potassium", type: "number", unit: "mmol/L" },
    { field: "Chloride", type: "number", unit: "mmol/L" },
    { field: "Bicarbonate", type: "number", unit: "mmol/L" },
  ],
  "Blood Grouping": [
    { field: "Blood Group", type: "select", options: ["A", "B", "AB", "O"] },
    { field: "Rh Factor", type: "select", options: ["Positive", "Negative"] },
  ],
};
