# Property Images Error Fix - Action Required

## Issue
The error `Error inserting images: {}` occurs when adding a new property with images. This is caused by a missing **UPDATE policy** in the Supabase `property_images` table Row Level Security (RLS).

## Root Cause
The `property_images` table has SELECT, INSERT, and DELETE policies, but is **missing an UPDATE policy**. This prevents the edit page from updating image properties like `is_primary` and `display_order`.

## Solution Applied

### 1. Improved Error Handling (✅ Committed: ffc72c8)
- Added comprehensive error logging with detailed error properties
- Added 100ms delay to ensure property insert is committed before images
- Added user-friendly warning toast if images fail to save
- Property will still be created successfully, images can be added via edit page

### 2. SQL Migration Required (⚠️ **ACTION NEEDED**)

**File**: `scripts/008_add_property_images_update_policy.sql`

You need to run this SQL script in your Supabase database to add the UPDATE policy.

## How to Apply the Fix

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project: **Real-Estate-Hub**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `scripts/008_add_property_images_update_policy.sql`:

```sql
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
```

6. Click **Run** (or press Ctrl+Enter)
7. Verify success message appears

### Option 2: Via Supabase CLI

```bash
# From project root
supabase db push --db-url "your-supabase-connection-string" < scripts/008_add_property_images_update_policy.sql
```

### Option 3: Via psql Command Line

```bash
psql "your-supabase-connection-string" -f scripts/008_add_property_images_update_policy.sql
```

## Verification

After running the migration, test the following:

### Test 1: Add Property with Images
1. Go to `/properties/add`
2. Fill in property details
3. Upload 2-3 images
4. Click "Add Property"
5. **Expected**: Property and images save successfully
6. **Check**: No error in console, images display on properties list

### Test 2: Edit Property Images
1. Go to `/properties` (list page)
2. Click "Edit" on any property
3. Add/remove/reorder images
4. Click "Save Changes"
5. **Expected**: Changes save successfully
6. **Check**: View the property detail page, verify image changes

### Test 3: Reorder Images
1. Edit a property with multiple images
2. Drag images to reorder (or delete first image to make second image primary)
3. Save changes
4. **Expected**: `display_order` and `is_primary` update correctly
5. **Check**: Primary image shows correctly on list/browse pages

## What Changed

### Before (Missing UPDATE Policy)
```
property_images RLS policies:
✅ SELECT - Anyone can view
✅ INSERT - Owner can insert
✅ DELETE - Owner can delete
❌ UPDATE - No policy (BLOCKED)
```

### After (Complete RLS Policies)
```
property_images RLS policies:
✅ SELECT - Anyone can view
✅ INSERT - Owner can insert
✅ DELETE - Owner can delete
✅ UPDATE - Owner can update (FIXED)
```

## Improved Error Handling

The code now provides better debugging information:

**Console Output (on error)**:
```javascript
Attempting to insert images: {
  propertyId: "uuid-here",
  userId: "user-uuid",
  imageCount: 3,
  images: [...]
}

Error inserting images: {
  error: {...},
  message: "Error message",
  details: "Detailed error info",
  hint: "Suggested fix",
  code: "error_code"
}
```

**User Toast (on error)**:
```
⚠️ Warning
Property created but images failed to save.
Please edit the property to add images.
```

## Rollback (if needed)

If you need to remove the UPDATE policy:

```sql
drop policy if exists "property_images_update_own" on public.property_images;
```

## Related Files

- `app/properties/add/page.tsx` - Improved error handling (ffc72c8)
- `app/properties/[id]/edit/page.tsx` - Already has correct UPDATE logic
- `scripts/003_create_property_images.sql` - Original table creation
- `scripts/008_add_property_images_update_policy.sql` - **NEW** UPDATE policy migration

## Status

- ✅ Error handling improvements committed and pushed
- ⚠️ **SQL migration pending** - You must run the migration manually
- ✅ Documentation complete
- ⏳ Awaiting verification after migration

## Next Steps

1. **Run the SQL migration** (see options above)
2. **Test** adding a property with images
3. **Verify** no console errors
4. **Confirm** images display on list/browse/detail pages
5. **Update** this file with migration status once complete

---

**Created**: October 27, 2024  
**Commit**: ffc72c8  
**Status**: Migration pending  
**Priority**: High (affects property creation workflow)
