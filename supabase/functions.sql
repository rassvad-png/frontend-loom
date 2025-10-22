-- =====================================================
-- HELPER FUNCTIONS FOR ANALYTICS
-- =====================================================

-- Function to increment view count
create or replace function public.increment_views(app_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.apps
  set views = views + 1
  where id = app_id;
end;
$$;

-- Function to increment install count
create or replace function public.increment_installs(app_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.apps
  set installs = installs + 1
  where id = app_id;
end;
$$;
