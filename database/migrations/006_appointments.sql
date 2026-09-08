CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT,
  price NUMERIC(10,2),
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  final_price NUMERIC(10,2),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_status TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.appointment_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_company_id ON public.appointments(company_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON public.appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_company_date ON public.appointments(company_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_date ON public.appointments(professional_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_client_date ON public.appointments(client_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON public.appointments(deleted_at);

CREATE INDEX IF NOT EXISTS idx_appointment_status_history_appointment_id ON public.appointment_status_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_status_history_company_id ON public.appointment_status_history(company_id);
CREATE INDEX IF NOT EXISTS idx_appointment_status_history_created_at ON public.appointment_status_history(created_at);

CREATE TRIGGER set_updated_at_appointments
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.appointment_status_history_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.appointment_status_history (
      appointment_id,
      company_id,
      old_status,
      new_status,
      changed_by,
      created_at
    ) VALUES (
      NEW.id,
      NEW.company_id,
      NULL,
      NEW.status,
      NEW.created_by,
      now()
    );
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE' AND OLD.status <> NEW.status) THEN
    INSERT INTO public.appointment_status_history (
      appointment_id,
      company_id,
      old_status,
      new_status,
      changed_by,
      created_at
    ) VALUES (
      NEW.id,
      NEW.company_id,
      OLD.status,
      NEW.status,
      NEW.updated_by,
      now()
    );
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_status_history
AFTER INSERT OR UPDATE OF status ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.appointment_status_history_trigger();
