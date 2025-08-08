-- Update users with sample location data
UPDATE users SET 
  latitude = 37.7749,
  longitude = -122.4194,
  city = 'San Francisco',
  state = 'California'
WHERE email = 'alex.chen@example.com';

UPDATE users SET 
  latitude = 37.7849,
  longitude = -122.4094,
  city = 'San Francisco',
  state = 'California'
WHERE email = 'sarah.kim@example.com';

UPDATE users SET 
  latitude = 37.7649,
  longitude = -122.4294,
  city = 'San Francisco',
  state = 'California'
WHERE email = 'mike.johnson@example.com';

UPDATE users SET 
  latitude = 37.7549,
  longitude = -122.4394,
  city = 'San Francisco',
  state = 'California'
WHERE email = 'emma.davis@example.com';

-- Update swap listings with location coordinates
UPDATE swap_listings SET 
  latitude = 37.7749,
  longitude = -122.4194
WHERE user_id = (SELECT id FROM users WHERE email = 'alex.chen@example.com');

UPDATE swap_listings SET 
  latitude = 37.7849,
  longitude = -122.4094
WHERE user_id = (SELECT id FROM users WHERE email = 'sarah.kim@example.com');

UPDATE swap_listings SET 
  latitude = 37.7649,
  longitude = -122.4294
WHERE user_id = (SELECT id FROM users WHERE email = 'mike.johnson@example.com');

UPDATE swap_listings SET 
  latitude = 37.7549,
  longitude = -122.4394
WHERE user_id = (SELECT id FROM users WHERE email = 'emma.davis@example.com');

-- Calculate and update trust scores for all users
SELECT calculate_trust_score(id) FROM users;
