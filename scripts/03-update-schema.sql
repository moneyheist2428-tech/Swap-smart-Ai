-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100);

-- Add new columns to swap_listings table
ALTER TABLE swap_listings ADD COLUMN IF NOT EXISTS is_flash_swap BOOLEAN DEFAULT FALSE;
ALTER TABLE swap_listings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE swap_listings ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE swap_listings ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create trust_scores table
CREATE TABLE IF NOT EXISTS trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    completed_swaps INTEGER DEFAULT 0,
    positive_ratings INTEGER DEFAULT 0,
    disputes INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for geolocation queries
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_swap_listings_location ON swap_listings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_swap_listings_flash_swap ON swap_listings(is_flash_swap, expires_at);

-- Function to calculate trust score
CREATE OR REPLACE FUNCTION calculate_trust_score(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    completed_swaps_count INTEGER;
    positive_ratings_count INTEGER;
    total_ratings_count INTEGER;
    disputes_count INTEGER;
    trust_score INTEGER;
BEGIN
    -- Get completed swaps count
    SELECT COUNT(*) INTO completed_swaps_count
    FROM swap_requests 
    WHERE (from_user_id = user_id_param OR to_user_id = user_id_param) 
    AND status = 'completed';
    
    -- Get positive ratings count (4-5 stars)
    SELECT COUNT(*) INTO positive_ratings_count
    FROM user_ratings 
    WHERE rated_id = user_id_param AND rating >= 4;
    
    -- Get total ratings count
    SELECT COUNT(*) INTO total_ratings_count
    FROM user_ratings 
    WHERE rated_id = user_id_param;
    
    -- Get disputes count
    SELECT COUNT(*) INTO disputes_count
    FROM fraud_reports 
    WHERE listing_id IN (
        SELECT id FROM swap_listings WHERE user_id = user_id_param
    ) AND status = 'confirmed';
    
    -- Calculate trust score (0-100)
    trust_score := LEAST(100, 
        (completed_swaps_count * 5) + 
        (CASE WHEN total_ratings_count > 0 
         THEN (positive_ratings_count * 100 / total_ratings_count) 
         ELSE 0 END) - 
        (disputes_count * 20)
    );
    
    -- Ensure minimum score of 0
    trust_score := GREATEST(0, trust_score);
    
    -- Update trust_scores table
    INSERT INTO trust_scores (user_id, score, completed_swaps, positive_ratings, disputes)
    VALUES (user_id_param, trust_score, completed_swaps_count, positive_ratings_count, disputes_count)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        score = trust_score,
        completed_swaps = completed_swaps_count,
        positive_ratings = positive_ratings_count,
        disputes = disputes_count,
        last_updated = NOW();
    
    RETURN trust_score;
END;
$$ LANGUAGE plpgsql;
