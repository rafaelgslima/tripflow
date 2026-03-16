-- Add persistent ordering for itinerary items
-- Introduces sort_order to store user-defined ordering per travel_plan_id + date

ALTER TABLE public.itinerary_item
ADD COLUMN sort_order INTEGER;

-- Backfill existing rows using created_at ascending within each day
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY travel_plan_id, date
      ORDER BY created_at ASC
    ) - 1 AS sort_order
  FROM public.itinerary_item
)
UPDATE public.itinerary_item i
SET sort_order = r.sort_order
FROM ranked r
WHERE i.id = r.id;

ALTER TABLE public.itinerary_item
ALTER COLUMN sort_order SET NOT NULL;

-- Ensure deterministic, collision-free ordering per day
ALTER TABLE public.itinerary_item
ADD CONSTRAINT itinerary_item_unique_sort_order_per_day
UNIQUE (travel_plan_id, date, sort_order);

-- Optimize list queries by day in saved order
CREATE INDEX idx_itinerary_day_sort_order
ON public.itinerary_item(travel_plan_id, date, sort_order);
