-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('educational', 'government', 'private')),
  category TEXT NOT NULL, -- University, FRSC, Company, etc.
  code TEXT UNIQUE NOT NULL, -- Organization identifier code
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document types table
CREATE TABLE public.document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Registration Number, NIN, Driver's License, etc.
  code TEXT NOT NULL, -- REG_NUM, NIN, DL, etc.
  description TEXT,
  required_fields JSONB, -- Store field requirements as JSON
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'org_admin', 'verification_agent', 'member')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id, role)
);

-- Create members table (enhanced from existing fud_students)
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES public.document_types(id) ON DELETE RESTRICT,
  document_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  other_names TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, document_type_id, document_number)
);

-- Create verification logs table
CREATE TABLE public.verification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  verified_by UUID NOT NULL, -- user_id of verifier
  verification_method TEXT NOT NULL CHECK (verification_method IN ('face_id', 'fingerprint', 'both')),
  verification_status TEXT NOT NULL CHECK (verification_status IN ('success', 'failed', 'pending')),
  confidence_score NUMERIC(5,2), -- 0.00 to 100.00
  location_data JSONB, -- GPS coordinates, address, etc.
  device_info JSONB, -- Device used for verification
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL, -- Class, Meeting, etc.
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  check_out_time TIMESTAMP WITH TIME ZONE,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('face_id', 'fingerprint', 'both')),
  location_data JSONB,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizations
CREATE POLICY "Organizations are viewable by authenticated users" 
ON public.organizations FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only super admins can manage organizations" 
ON public.organizations FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Create RLS policies for document types
CREATE POLICY "Document types are viewable by org members" 
ON public.document_types FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND (organization_id = document_types.organization_id OR role = 'super_admin')
  )
);

-- Create RLS policies for user roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Org admins and super admins can manage roles" 
ON public.user_roles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND (ur.role = 'super_admin' OR (ur.role = 'org_admin' AND ur.organization_id = user_roles.organization_id))
  )
);

-- Create RLS policies for members
CREATE POLICY "Members are viewable by org members" 
ON public.members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND (organization_id = members.organization_id OR role = 'super_admin')
  )
);

-- Create RLS policies for verification logs
CREATE POLICY "Verification logs viewable by org members" 
ON public.verification_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.members m
    JOIN public.user_roles ur ON ur.organization_id = m.organization_id
    WHERE m.id = verification_logs.member_id 
    AND ur.user_id = auth.uid()
  )
);

-- Create RLS policies for attendance records
CREATE POLICY "Attendance records viewable by org members" 
ON public.attendance_records FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND (organization_id = attendance_records.organization_id OR role = 'super_admin')
  )
);

-- Insert default organizations and document types
INSERT INTO public.organizations (name, type, category, code, address) VALUES
-- Educational
('University of Nigeria, Nsukka', 'educational', 'University', 'UNN', 'Nsukka, Enugu State'),
('Ahmadu Bello University', 'educational', 'University', 'ABU', 'Zaria, Kaduna State'),
('Federal University of Technology, Akure', 'educational', 'University', 'FUTA', 'Akure, Ondo State'),
-- Government Agencies
('Federal Road Safety Corps', 'government', 'Road Safety', 'FRSC', 'Abuja, FCT'),
('Vehicle Inspection Office', 'government', 'Vehicle Inspection', 'VIO', 'Various States'),
('Kano State Road Traffic Agency', 'government', 'Traffic Agency', 'KAROTA', 'Kano State'),
('Nigeria Police Force', 'government', 'Law Enforcement', 'NPF', 'Abuja, FCT'),
('Nigeria Immigration Service', 'government', 'Immigration', 'NIS', 'Abuja, FCT'),
-- Private Organizations (examples)
('Dangote Group', 'private', 'Conglomerate', 'DG', 'Lagos State'),
('Access Bank PLC', 'private', 'Financial Services', 'ACCESS', 'Lagos State');

-- Insert document types
INSERT INTO public.document_types (organization_id, name, code, description) 
SELECT o.id, dt.name, dt.code, dt.description
FROM public.organizations o
CROSS JOIN (VALUES
  ('Registration Number', 'REG_NUM', 'Student registration number'),
  ('Matriculation Number', 'MATRIC_NUM', 'Student matriculation number'),
  ('Staff ID', 'STAFF_ID', 'Staff identification number')
) AS dt(name, code, description)
WHERE o.type = 'educational';

INSERT INTO public.document_types (organization_id, name, code, description)
SELECT o.id, dt.name, dt.code, dt.description
FROM public.organizations o
CROSS JOIN (VALUES
  ('National ID Number', 'NIN', 'National identification number'),
  ('Driver License', 'DL', 'Driver license number'),
  ('Voter Card', 'VC', 'Voter registration card'),
  ('Officer ID', 'OFFICER_ID', 'Officer identification number'),
  ('Service Number', 'SERVICE_NUM', 'Service identification number')
) AS dt(name, code, description)
WHERE o.type = 'government';

INSERT INTO public.document_types (organization_id, name, code, description)
SELECT o.id, dt.name, dt.code, dt.description
FROM public.organizations o
CROSS JOIN (VALUES
  ('Employee ID', 'EMP_ID', 'Employee identification number'),
  ('Business Registration', 'BIZ_REG', 'Business registration number')
) AS dt(name, code, description)
WHERE o.type = 'private';

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_types_updated_at
  BEFORE UPDATE ON public.document_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at
  BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();