-- Add image_urls column to maintenance_requests table
alter table public.maintenance_requests 
add column if not exists image_urls text;

comment on column public.maintenance_requests.image_urls is 'Comma-separated list of image URLs uploaded with the maintenance request';
