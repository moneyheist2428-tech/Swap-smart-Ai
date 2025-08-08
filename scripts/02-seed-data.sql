-- Insert sample users
INSERT INTO users (email, name, bio, verified, rating, total_swaps, badges) VALUES
('alex.chen@example.com', 'Alex Chen', 'Tech enthusiast and gadget collector. Love swapping electronics and finding unique items!', true, 4.9, 15, ARRAY['Verified Swapper', 'Tech Expert']),
('sarah.kim@example.com', 'Sarah Kim', 'Full-stack developer and designer. Always looking for creative collaborations and skill exchanges.', true, 4.8, 12, ARRAY['Verified Swapper', 'Service Provider']),
('mike.johnson@example.com', 'Mike Johnson', 'Collector of vintage items and comics. Passionate about finding rare collectibles.', true, 4.7, 8, ARRAY['Verified Swapper', 'Collector']),
('emma.davis@example.com', 'Emma Davis', 'Mobile app developer and photography enthusiast. Love trading tech and creative services.', true, 4.9, 20, ARRAY['Verified Swapper', 'Top Trader', 'Photography Pro']);

-- Insert sample swap listings
INSERT INTO swap_listings (user_id, title, description, category, subcategory, estimated_value, condition, location, wanted_items, ai_tags) VALUES
((SELECT id FROM users WHERE email = 'alex.chen@example.com'), 
 'MacBook Pro M2 for Gaming Setup', 
 'Trading my 2022 MacBook Pro 14-inch with M2 chip, 16GB RAM, 512GB SSD. Excellent condition, barely used. Looking for a complete gaming setup with RTX 4070 or equivalent.', 
 'physical', 'Electronics', 2500.00, 'like-new', 'San Francisco, CA', 
 ARRAY['Gaming PC', 'RTX 4070', 'Gaming Setup', 'Desktop Computer'], 
 ARRAY['laptop', 'apple', 'macbook', 'high-value', 'electronics']),

((SELECT id FROM users WHERE email = 'sarah.kim@example.com'), 
 'Web Development Services for Logo Design', 
 'Offering full-stack web development services (React, Node.js, PostgreSQL) for 40 hours in exchange for professional branding package including logo design, brand guidelines, and marketing materials.', 
 'services', 'Web Development', 1200.00, null, 'Remote', 
 ARRAY['Logo Design', 'Branding', 'Graphic Design', 'Marketing Materials'], 
 ARRAY['web-development', 'react', 'nodejs', 'professional-service']),

((SELECT id FROM users WHERE email = 'mike.johnson@example.com'), 
 'Rare Pokemon Cards for Vintage Comics', 
 'Complete collection of 1st edition Pokemon cards including Charizard, Blastoise, and Venusaur. All cards are in mint condition with protective sleeves. Looking for Marvel/DC vintage comics from the 80s-90s.', 
 'physical', 'Collectibles', 800.00, 'new', 'New York, NY', 
 ARRAY['Vintage Comics', 'Marvel Comics', 'DC Comics', 'Comic Books'], 
 ARRAY['pokemon', 'trading-cards', 'collectibles', 'mint-condition']),

((SELECT id FROM users WHERE email = 'emma.davis@example.com'), 
 'iPhone 15 Pro for Android Flagship', 
 'Brand new iPhone 15 Pro 256GB in Natural Titanium. Still sealed in box, received as a gift but prefer Android. Looking to swap for latest Samsung Galaxy S24 Ultra or Google Pixel 8 Pro.', 
 'physical', 'Electronics', 1200.00, 'new', 'Los Angeles, CA', 
 ARRAY['Samsung Galaxy S24', 'Google Pixel 8', 'Android Phone', 'Flagship Phone'], 
 ARRAY['iphone', 'smartphone', 'brand-new', 'high-value']);

-- Insert sample swap requests
INSERT INTO swap_requests (from_user_id, to_user_id, from_listing_id, to_listing_id, message, status) VALUES
((SELECT id FROM users WHERE email = 'sarah.kim@example.com'),
 (SELECT id FROM users WHERE email = 'alex.chen@example.com'),
 (SELECT id FROM swap_listings WHERE title = 'Web Development Services for Logo Design'),
 (SELECT id FROM swap_listings WHERE title = 'MacBook Pro M2 for Gaming Setup'),
 'Hi Alex! I saw your MacBook listing and I think we could make a great swap. I can provide full-stack web development services including a custom portfolio website, e-commerce platform, or any web application you need. Let me know if you''re interested!',
 'pending');

-- Insert sample chat messages
INSERT INTO chat_messages (swap_request_id, sender_id, message) VALUES
((SELECT id FROM swap_requests LIMIT 1),
 (SELECT id FROM users WHERE email = 'sarah.kim@example.com'),
 'Hi Alex! I saw your MacBook listing and I think we could make a great swap. I can provide full-stack web development services including a custom portfolio website, e-commerce platform, or any web application you need. Let me know if you''re interested!'),
((SELECT id FROM swap_requests LIMIT 1),
 (SELECT id FROM users WHERE email = 'alex.chen@example.com'),
 'Hi Sarah! That sounds interesting. I actually need a new portfolio website for my consulting business. What kind of timeline are we looking at for the development work?');

-- Insert sample user ratings
INSERT INTO user_ratings (rater_id, rated_id, rating, comment) VALUES
((SELECT id FROM users WHERE email = 'sarah.kim@example.com'),
 (SELECT id FROM users WHERE email = 'alex.chen@example.com'),
 5,
 'Excellent communication and very professional. The MacBook was exactly as described and the swap went smoothly!'),
((SELECT id FROM users WHERE email = 'mike.johnson@example.com'),
 (SELECT id FROM users WHERE email = 'emma.davis@example.com'),
 5,
 'Great swapper! Very responsive and honest about item condition. Would definitely swap again!');
