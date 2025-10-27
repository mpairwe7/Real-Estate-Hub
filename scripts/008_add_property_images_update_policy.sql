-- Add UPDATE policy for property_images
-- This allows property owners to update their property images (e.g., change is_primary, display_order)

create policy "property_images_update_own"
  on public.property_images for update
  using (
    exists (
      select 1 from public.properties
      where id = property_id and owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties
      where id = property_id and owner_id = auth.uid()
    )
  );
