CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_open BOOLEAN NOT NULL DEFAULT true,
  open_time TIME,
  close_time TIME,
  break_start TIME,
  break_end TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.professional_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_open BOOLEAN NOT NULL DEFAULT true,
  open_time TIME,
  close_time TIME,
  break_start TIME,
  break_end TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(professional_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  name TEXT,
  recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  block_type TEXT NOT NULL CHECK (block_type IN ('day', 'time', 'range')),
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_hours_company_id ON public.business_hours(company_id);

CREATE INDEX IF NOT EXISTS idx_professional_hours_professional_id ON public.professional_hours(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_hours_company_id ON public.professional_hours(company_id);

CREATE INDEX IF NOT EXISTS idx_holidays_company_id ON public.holidays(company_id);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON public.holidays(date);

CREATE INDEX IF NOT EXISTS idx_schedule_blocks_company_id ON public.schedule_blocks(company_id);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_professional_id ON public.schedule_blocks(professional_id);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_dates ON public.schedule_blocks(start_date, end_date);

CREATE TRIGGER set_updated_at_business_hours
BEFORE UPDATE ON public.business_hours
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_professional_hours
BEFORE UPDATE ON public.professional_hours
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
