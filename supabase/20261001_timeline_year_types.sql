-- A Timeline aceita rótulos históricos (por exemplo, "Actualidade"), enquanto
-- os anos das edições FITI continuam estritamente numéricos.
alter table public.timeline
  alter column year type text using year::text;

alter table public.fiti_editions
  alter column year type integer using nullif(year::text, '')::integer;

alter table public.fiti_archive
  alter column year type integer using nullif(year::text, '')::integer;
