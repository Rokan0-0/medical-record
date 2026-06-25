-- 1. Create Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY, -- Client-generated format (e.g., MED-XXXXXX-XXX)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    emergency_contact TEXT NOT NULL,
    emergency_phone TEXT NOT NULL,
    insurance_provider TEXT,
    policy_number TEXT,
    group_number TEXT,
    allergies TEXT,
    medications TEXT,
    blood_type TEXT,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('condition', 'surgery', 'allergy', 'medication')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
    status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'chronic')),
    doctor TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Lab Results Table
CREATE TABLE IF NOT EXISTS lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    patient_name TEXT NOT NULL,
    test_type TEXT NOT NULL CHECK (test_type IN ('blood', 'urine', 'imaging', 'biopsy', 'other')),
    test_name TEXT NOT NULL,
    order_date DATE NOT NULL,
    result_date DATE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'abnormal', 'critical')),
    doctor TEXT NOT NULL,
    results JSONB DEFAULT '[]'::jsonB,
    notes TEXT,
    attachments TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Doctor Notes Table
CREATE TABLE IF NOT EXISTS doctor_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    patient_name TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    date DATE NOT NULL,
    visit_type TEXT NOT NULL CHECK (visit_type IN ('consultation', 'follow-up', 'emergency', 'routine', 'specialist')),
    chief_complaint TEXT NOT NULL,
    diagnosis TEXT,
    treatment_plan TEXT,
    medications TEXT,
    follow_up TEXT,
    notes TEXT,
    vitals JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('draft', 'completed', 'reviewed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    doctor TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Disable Row Level Security (RLS) to allow direct frontend read/write during development
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
