CREATE DATABASE clinic;

CREATE TYPE gender AS ENUM ('F', 'M', 'O');
CREATE TYPE role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE blood_type AS ENUM ('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-');
CREATE TYPE appointment_status AS ENUM (
    'scheduled', 
    'completed', 
    'cancelled_by_doctor', 
    'cancelled_by_patient', 
    'no_show'
);
CREATE TYPE day_of_week AS ENUM (
    'monday', 
    'tuesday', 
    'wednesday', 
    'thursday', 
    'friday', 
    'saturday', 
    'sunday'
);
CREATE TYPE file_category AS ENUM ('x_ray', 'lab_result', 'prescription', 'other');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    names VARCHAR(255) NOT NULL,
    last_names VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role role NOT NULL,
    status account_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    document_id VARCHAR(30) UNIQUE, 
    birth_date DATE,
    gender gender NOT NULL,
    address VARCHAR(255),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE specialties (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    medical_license VARCHAR(50) UNIQUE NOT NULL,
    specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE RESTRICT
);

CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_week day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT check_schedule_hours CHECK (start_time < end_time)
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    reason_visit TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_appointment_times CHECK (start_time < end_time)
);

CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    patient_id UUID NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
    blood_type blood_type NOT NULL,
    chronic_diseases TEXT,
    allergies TEXT,
    surgical_history TEXT,
    family_history TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    consultation_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    symptoms TEXT,
    diagnosis TEXT NOT NULL,
    physical_examination TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE treatments (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    medication_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100),
    instructions TEXT,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE
);

CREATE TABLE medical_files (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    category file_category NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_users INTEGER DEFAULT 0,
    total_doctors INTEGER DEFAULT 0,
    total_patients INTEGER DEFAULT 0,
    total_appointments_today INTEGER DEFAULT 0,
    total_consultations_today INTEGER DEFAULT 0,
    total_treatments_today INTEGER DEFAULT 0,
    total_revenue_today DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_specialty ON doctors(specialty_id);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_doctor_schedules_doctor ON doctor_schedules(doctor_id, day_week);
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_medical_files_patient ON medical_files(patient_id);

INSERT INTO specialties (name, description) VALUES
('Cardiology', 'Heart and blood vessel related treatments.'),
('Dermatology', 'Skin related treatments.'),
('Neurology', 'Nervous system related treatments.'),
('Pediatrics', 'Child health and treatments.'),
('General Medicine', 'General health checkups and treatments.');

INSERT INTO users (names, last_names, email, password_hash, role) VALUES
('Admin', 'User', 'admin@example.com', 'hashed_password', 'admin');

INSERT INTO users (names, last_names, email, password_hash, role) VALUES
('John', 'Doe', 'john.doe@example.com', 'hashed_password', 'patient'),
('Jane', 'Smith', 'jane.smith@example.com', 'hashed_password', 'patient'),
('Alice', 'Johnson', 'alice.johnson@example.com', 'hashed_password', 'patient'),
('Bob', 'Brown', 'bob.brown@example.com', 'hashed_password', 'patient'),
('Charlie', 'Davis', 'charlie.davis@example.com', 'hashed_password', 'patient');

INSERT INTO users (names, last_names, email, password_hash, role) VALUES
('Dr. Emily', 'Clark', 'emily.clark@example.com', 'hashed_password', 'doctor'),
('Dr. Michael', 'Lee', 'michael.lee@example.com', 'hashed_password', 'doctor'),
('Dr. Sarah', 'Wilson', 'sarah.wilson@example.com', 'hashed_password', 'doctor'),
('Dr. David', 'Martinez', 'david.martinez@example.com', 'hashed_password', 'doctor');