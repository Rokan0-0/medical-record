-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- plain text for simple community prototype validation
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'student')),
    full_name TEXT NOT NULL,
    patient_id TEXT, -- References patients(id) if role is 'student'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable Row Level Security (RLS) for users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Clear existing seed data (optional, helps run script multiple times)
TRUNCATE TABLE appointments CASCADE;
TRUNCATE TABLE doctor_notes CASCADE;
TRUNCATE TABLE lab_results CASCADE;
TRUNCATE TABLE medical_records CASCADE;
DELETE FROM users;
DELETE FROM patients;

-- 3. Seed Patients
INSERT INTO patients (
    id, first_name, last_name, date_of_birth, gender, phone, email, 
    address, city, state, zip_code, emergency_contact, emergency_phone, 
    insurance_provider, policy_number, group_number, allergies, medications, blood_type, registration_date
) VALUES 
(
    'MED-884920-101', 'Alex', 'Smith', '2002-05-15', 'male', '(555) 111-2222', 'alex.smith@university.edu',
    '456 College Way, Dorm B', 'Boston', 'MA', '02115', 'Sarah Smith', '(555) 111-3333',
    'Blue Cross Blue Shield', 'BC-992384-12', 'GP-8834-A', 'Peanuts, Penicillin', 'Albuterol Inhaler (as needed)', 'O+', NOW()
),
(
    'MED-773829-202', 'Emily', 'Jones', '1995-11-23', 'female', '(555) 444-5555', 'emily.jones@gmail.com',
    '789 Maple Ave', 'Boston', 'MA', '02116', 'David Jones', '(555) 444-6666',
    'Aetna', 'AE-774829-01', 'GP-1123-B', 'None', 'Metformin 500mg daily', 'A-', NOW()
),
(
    'MED-662938-303', 'Robert', 'Miller', '1960-03-08', 'male', '(555) 777-8888', 'r.miller@hotmail.com',
    '101 Pine Road', 'Quincy', 'MA', '02169', 'Mary Miller', '(555) 777-9999',
    'UnitedHealthcare', 'UH-109283-99', 'GP-4482-D', 'Sulfa drugs', 'Lisinopril 10mg daily, Atorvastatin 20mg daily', 'AB+', NOW()
);

-- 4. Seed Users (Admin, Doctor, Student)
-- Link Student user to Alex Smith's patient profile ('MED-884920-101')
INSERT INTO users (id, username, password, email, role, full_name, patient_id) VALUES
(gen_random_uuid(), 'admin', 'admin123', 'admin@medicare.org', 'admin', 'System Administrator', NULL),
(gen_random_uuid(), 'doctor', 'doctor123', 'j.johnson@medicare.org', 'staff', 'Dr. Jane Johnson', NULL),
(gen_random_uuid(), 'student', 'student123', 'alex.smith@university.edu', 'student', 'Alex Smith', 'MED-884920-101');

-- 5. Seed Medical Records for Patients
INSERT INTO medical_records (patient_id, type, title, description, date, severity, status, doctor, notes) VALUES
-- Alex Smith's records
('MED-884920-101', 'condition', 'Mild Asthma', 'Intermittent asthma triggered by exercise and pollen.', '2021-08-10', 'low', 'active', 'Dr. Jane Johnson', 'Keep inhaler on hand during physical activity.'),
('MED-884920-101', 'allergy', 'Peanut Allergy', 'Severe anaphylactic reaction to peanuts.', '2008-04-12', 'high', 'chronic', 'Dr. Robert Carter', 'Epipen prescribed and active.'),
('MED-884920-101', 'medication', 'Albuterol HFA Inhaler', '90 mcg/actuation inhaler. 2 puffs every 4-6 hours as needed for wheezing.', '2025-01-15', 'low', 'active', 'Dr. Jane Johnson', 'Asthma control is generally good.'),

-- Emily Jones's records
('MED-773829-202', 'condition', 'Type 2 Diabetes', 'Diagnosed during routine physical. Managed with diet and oral medications.', '2024-02-18', 'medium', 'active', 'Dr. Jane Johnson', 'HbA1c last checked: 6.8%'),
('MED-773829-202', 'surgery', 'Appendectomy', 'Laparoscopic appendectomy performed at General Hospital.', '2018-09-05', NULL, 'resolved', 'Dr. Sarah Higgins', 'Recovered fully without complications.'),

-- Robert Miller's records
('MED-662938-303', 'condition', 'Hypertension', 'Essential hypertension. Blood pressure well controlled on daily Lisinopril.', '2015-10-22', 'medium', 'active', 'Dr. Jane Johnson', 'Monitor BP weekly at home.'),
('MED-662938-303', 'condition', 'Hyperlipidemia', 'Elevated LDL cholesterol. Managed with statin therapy and low-fat diet.', '2019-05-14', 'medium', 'active', 'Dr. Jane Johnson', 'Follow up lipid panel in 6 months.');

-- 6. Seed Lab Results
INSERT INTO lab_results (patient_id, patient_name, test_type, test_name, order_date, result_date, status, doctor, results, notes) VALUES
(
    'MED-884920-101', 'Alex Smith', 'blood', 'Allergy Panel - IgE', '2025-03-10', '2025-03-12', 'completed', 'Dr. Jane Johnson',
    '[
        {"parameter": "Total IgE", "value": "180", "unit": "kU/L", "referenceRange": "< 100", "status": "high"},
        {"parameter": "Peanut IgE", "value": "24.5", "unit": "kUA/L", "referenceRange": "< 0.35", "status": "critical"}
    ]'::jsonb,
    'Confirmed severe peanut allergy. Avoid peanuts and carry Epipen.'
),
(
    'MED-773829-202', 'Emily Jones', 'blood', 'Comprehensive Metabolic Panel & HbA1c', '2025-06-01', '2025-06-03', 'completed', 'Dr. Jane Johnson',
    '[
        {"parameter": "Glucose (Fasting)", "value": "134", "unit": "mg/dL", "referenceRange": "70-99", "status": "high"},
        {"parameter": "HbA1c", "value": "6.8", "unit": "%", "referenceRange": "4.0-5.6", "status": "high"},
        {"parameter": "Creatinine", "value": "0.85", "unit": "mg/dL", "referenceRange": "0.50-1.10", "status": "normal"}
    ]'::jsonb,
    'Diabetes control is stable but blood glucose remains slightly elevated. Continue current dosage of Metformin.'
),
(
    'MED-662938-303', 'Robert Miller', 'blood', 'Lipid Panel', '2025-06-20', NULL, 'pending', 'Dr. Jane Johnson',
    '[]'::jsonb,
    'Routine 6-month lipid evaluation.'
);

-- 7. Seed Doctor Notes
INSERT INTO doctor_notes (patient_id, patient_name, doctor_name, date, visit_type, chief_complaint, diagnosis, treatment_plan, medications, follow_up, notes, vitals, status) VALUES
(
    'MED-884920-101', 'Alex Smith', 'Dr. Jane Johnson', '2025-01-15', 'routine', 
    'Routine checkup and asthma prescription renewal.', 
    'Mild intermittent asthma, controlled.', 
    'Continue current management plan. Avoid pollen peaks.', 
    'Albuterol HFA Inhaler 90 mcg as needed.', 
    'Return in 6 months or if asthma symptoms worsen.', 
    'Patient reports using rescue inhaler 1-2 times per week, primarily during exercise. Lungs clear to auscultation.',
    '{"bloodPressure": "118/76", "heartRate": "68 bpm", "temperature": "98.4 F", "weight": "165 lbs", "height": "5ft 10in"}'::jsonb, 
    'completed'
),
(
    'MED-773829-202', 'Emily Jones', 'Dr. Jane Johnson', '2025-06-03', 'follow-up', 
    'Follow up on fasting blood glucose and HbA1c results.', 
    'Type 2 Diabetes Mellitus, stable control.', 
    'Adjust diet to reduce refined carbohydrates. Exercise 30 minutes 4 times a week.', 
    'Metformin 500mg - 1 tablet orally twice daily with meals.', 
    'Follow up in 3 months with new HbA1c lab.', 
    'Reviewed blood test results with patient. Patient reports compliance with Metformin but admits to dietary lapses.',
    '{"bloodPressure": "128/82", "heartRate": "72 bpm", "temperature": "98.6 F", "weight": "154 lbs", "height": "5ft 4in"}'::jsonb, 
    'completed'
);

-- 8. Seed Appointments
INSERT INTO appointments (patient_id, patient_name, patient_phone, date, time, doctor, type, status, notes) VALUES
('MED-884920-101', 'Alex Smith', '(555) 111-2222', CURRENT_DATE, '09:00', 'Dr. Jane Johnson', 'General Checkup', 'confirmed', 'Routine checkup for asthma controls.'),
('MED-773829-202', 'Emily Jones', '(555) 444-5555', CURRENT_DATE, '10:30', 'Dr. Jane Johnson', 'Follow-up', 'scheduled', 'Diabetes checkup.'),
('MED-662938-303', 'Robert Miller', '(555) 777-8888', CURRENT_DATE + INTERVAL '1 day', '14:00', 'Dr. Jane Johnson', 'Consultation', 'scheduled', 'Review lipid panel results.');
