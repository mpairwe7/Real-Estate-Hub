-- Add display_order column to property_images table
alter table public.property_images 
add column if not exists display_order integer default 0;

comment on column public.property_images.display_order is 'Order in which the image should be displayed (0 = primary/first image)';

-- Create index for better query performance
create index if not exists property_images_display_order_idx 
on public.property_images(property_id, display_order);
