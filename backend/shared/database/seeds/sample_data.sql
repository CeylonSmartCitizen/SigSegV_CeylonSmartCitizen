-- Insert sample departments
INSERT INTO departments (id, name, name_si, name_ta, description, contact_number, email, working_hours) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Department of Registration of Persons', 'පුද්ගල ලේඛන දෙපාර්තමේන්තුව', 'நபர்கள் பதிவுத் திணைக்களம்', 'National Identity Card and vital registration services', '011-2691141', 'info@rgd.gov.lk', '{"monday": "08:30-16:30", "tuesday": "08:30-16:30", "wednesday": "08:30-16:30", "thursday": "08:30-16:30", "friday": "08:30-16:30", "saturday": "closed", "sunday": "closed"}'),
('550e8400-e29b-41d4-a716-446655440001', 'Divisional Secretariat - Colombo', 'ප්‍රාදේශීය ලේකම් කාර්යාලය - කොළඹ', 'பிரதேச செயலகம் - கொழும்பு', 'Local administrative services for Colombo district', '011-2345678', 'ds@colombo.gov.lk', '{"monday": "09:00-17:00", "tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00", "saturday": "closed", "sunday": "closed"}'),
('550e8400-e29b-41d4-a716-446655440002', 'Department of Motor Traffic', 'මෝටර් රථ ගමනාගමන දෙපාර්තමේන්තුව', 'மோட்டார் போக்குவரத்துத் திணைக்களம்', 'Vehicle registration and driving license services', '011-2677777', 'info@dmt.gov.lk', '{"monday": "08:00-16:00", "tuesday": "08:00-16:00", "wednesday": "08:00-16:00", "thursday": "08:00-16:00", "friday": "08:00-16:00", "saturday": "closed", "sunday": "closed"}');

-- Insert sample services
INSERT INTO services (department_id, name, name_si, name_ta, description, required_documents, estimated_duration_minutes, fee_amount, category) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'New NIC Application', 'නව ජාතික හැඳුනුම්පත්', 'புதிய தேசிய அடையாள அட்டை', 'Apply for new National Identity Card for citizens above 16', '["birth_certificate", "school_leaving_certificate", "parent_nic"]', 45, 500.00, 'identity'),
('550e8400-e29b-41d4-a716-446655440000', 'NIC Replacement', 'ජාතික හැඳුනුම්පත් ආදේශනය', 'தேசிய அடையாள அட்டை மாற்று', 'Replace lost or damaged National Identity Card', '["police_report", "affidavit", "passport_photo"]', 30, 1000.00, 'identity'),
('550e8400-e29b-41d4-a716-446655440001', 'Birth Certificate', 'උප්පැන්න සහතිකය', 'பிறப்புச் சான்றிதழ்', 'Obtain official birth certificate', '["hospital_birth_record", "parent_nic", "marriage_certificate"]', 60, 250.00, 'vital_records'),
('550e8400-e29b-41d4-a716-446655440002', 'Driving License', 'රිය පැදවීමේ බලපත්‍රය', 'ஓட்டுநர் உரிமம்', 'Apply for new driving license', '["nic", "medical_certificate", "eye_test_report"]', 90, 2500.00, 'transport');

-- Insert sample officers
INSERT INTO officers (department_id, officer_id, first_name, last_name, designation, email, specializations) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'OFF001', 'Kamala', 'Silva', 'Senior Registration Officer', 'kamala.silva@rgd.gov.lk', '{"identity"}'),
('550e8400-e29b-41d4-a716-446655440001', 'OFF002', 'Ruwan', 'Perera', 'Divisional Secretary', 'ruwan.perera@colombo.gov.lk', '{"vital_records", "certificates"}'),
('550e8400-e29b-41d4-a716-446655440002', 'OFF003', 'Priya', 'Fernando', 'Motor Traffic Officer', 'priya.fernando@dmt.gov.lk', '{"transport", "licenses"}');

-- Insert a sample user for testing
INSERT INTO users (email, phone_number, first_name, last_name, nic_number, password_hash, preferred_language) VALUES
('john.doe@email.com', '+94771234567', 'John', 'Doe', '123456789V', '$2b$10$example.hash.here', 'en'),
('saman.kumara@email.com', '+94712345678', 'Saman', 'Kumara', '987654321V', '$2b$10$example.hash.here', 'si');
