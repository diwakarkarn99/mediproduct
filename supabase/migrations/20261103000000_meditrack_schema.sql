-- MediTrack Production Database Schema (PRD v1.1 - 3 November 2026)
-- Target Platform: Supabase PostgreSQL with Row Level Security (RLS)

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('patient', 'caregiver');
CREATE TYPE dose_status AS ENUM ('pending', 'taken', 'snoozed', 'not_confirmed');
CREATE TYPE connection_status AS ENUM ('invited', 'accepted', 'granted', 'revoked');
CREATE TYPE recipient_category AS ENUM ('caregiver', 'family', 'community');
CREATE TYPE notification_delivery_status AS ENUM ('pending', 'sent', 'cancelled');
CREATE TYPE time_slot AS ENUM ('morning', 'afternoon', 'evening');

-- 2. Users Profile Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    phone TEXT,
    avatar_url TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Medicines Table
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    instructions TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    prescription_url TEXT,
    prescription_filename TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- 4. Medicine Schedules Table
CREATE TABLE IF NOT EXISTS public.medicine_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reminder_time TIME NOT NULL,
    slot time_slot NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_medicine_reminder UNIQUE (medicine_id, reminder_time)
);

-- 5. Dose Logs Table (One dose has one unique record per scheduled date and time)
CREATE TABLE IF NOT EXISTS public.dose_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES public.medicine_schedules(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status dose_status NOT NULL DEFAULT 'pending',
    taken_at TIMESTAMPTZ,
    snoozed_until TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_dose_event UNIQUE (schedule_id, scheduled_date, scheduled_time)
);

-- 6. Caregiver Connections Table
CREATE TABLE IF NOT EXISTS public.caregiver_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    caregiver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    caregiver_email TEXT NOT NULL,
    caregiver_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    message TEXT,
    status connection_status NOT NULL DEFAULT 'invited',
    can_view_medicines BOOLEAN NOT NULL DEFAULT TRUE,
    can_view_logs BOOLEAN NOT NULL DEFAULT TRUE,
    can_receive_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_patient_caregiver UNIQUE (patient_id, caregiver_email)
);

-- 7. Prescription Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES public.medicines(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT max_size_5mb CHECK (file_size <= 5242880)
);

-- 8. Notification Recipients (Escalation system)
CREATE TABLE IF NOT EXISTS public.notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    category recipient_category NOT NULL,
    escalation_order INTEGER NOT NULL DEFAULT 1,
    waiting_time_minutes INTEGER NOT NULL DEFAULT 30,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Notification Events Table
CREATE TABLE IF NOT EXISTS public.notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.notification_recipients(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    recipient_category recipient_category NOT NULL,
    message TEXT NOT NULL,
    dose_id UUID REFERENCES public.dose_logs(id) ON DELETE SET NULL,
    status notification_delivery_status NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Notification Settings Table
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    default_grace_period_minutes INTEGER NOT NULL DEFAULT 30,
    default_snooze_minutes INTEGER NOT NULL DEFAULT 10,
    is_alerts_paused BOOLEAN NOT NULL DEFAULT FALSE,
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '07:00:00',
    browser_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AI Usage Consent Table
CREATE TABLE IF NOT EXISTS public.ai_usage_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    has_consented BOOLEAN NOT NULL DEFAULT FALSE,
    consented_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON public.medicines(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_medicine ON public.medicine_schedules(medicine_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_user_date ON public.dose_logs(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_caregiver_conn_patient ON public.caregiver_connections(patient_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_conn_caregiver ON public.caregiver_connections(caregiver_id);

-- RLS Helper Function: can_view_patient
CREATE OR REPLACE FUNCTION public.can_view_patient(patient_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT (
        auth.uid() = patient_id
        OR EXISTS (
            SELECT 1 FROM public.caregiver_connections
            WHERE patient_id = $1
              AND caregiver_id = auth.uid()
              AND status = 'granted'
        )
    );
$$;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_consent ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users: read own or authorized caregiver
CREATE POLICY "Users read own profile" ON public.users
    FOR SELECT USING (auth.uid() = id OR public.can_view_patient(id));

CREATE POLICY "Users update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Medicines: Patients manage own medicines; Granted Caregivers can SELECT ONLY
CREATE POLICY "Patients full access to own medicines" ON public.medicines
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Caregivers read patient medicines" ON public.medicines
    FOR SELECT USING (public.can_view_patient(user_id));

-- Medicine Schedules: Patients full access; Granted Caregivers read only
CREATE POLICY "Patients full access to schedules" ON public.medicine_schedules
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Caregivers read patient schedules" ON public.medicine_schedules
    FOR SELECT USING (public.can_view_patient(user_id));

-- Dose Logs: Patients manage own logs; Granted Caregivers read only
CREATE POLICY "Patients full access to dose logs" ON public.dose_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Caregivers read patient dose logs" ON public.dose_logs
    FOR SELECT USING (public.can_view_patient(user_id));

-- Caregiver Connections: Patients manage; Caregiver can see own invites
CREATE POLICY "Patients manage caregiver connections" ON public.caregiver_connections
    FOR ALL USING (auth.uid() = patient_id);

CREATE POLICY "Caregivers view own connection" ON public.caregiver_connections
    FOR SELECT USING (caregiver_email = (SELECT email FROM public.users WHERE id = auth.uid()));

-- Documents: Strictly private to patient
CREATE POLICY "Private prescription documents" ON public.documents
    FOR ALL USING (auth.uid() = user_id);

-- Notifications: Patient only
CREATE POLICY "Patient manage notification recipients" ON public.notification_recipients
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Patient view notification events" ON public.notification_events
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Patient manage notification settings" ON public.notification_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Patient manage AI consent" ON public.ai_usage_consent
    FOR ALL USING (auth.uid() = user_id);
