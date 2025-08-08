-- Ensure all tables exist with proper structure
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    phone VARCHAR(20),
    verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_swaps INTEGER DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    trust_score INTEGER DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city VARCHAR(100),
    state VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS swap_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    images TEXT[] DEFAULT '{}',
    estimated_value DECIMAL(10,2),
    condition VARCHAR(20),
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    wanted_items TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    is_flash_swap BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    ai_description TEXT,
    ai_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_swap_listings_user_id ON swap_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_listings_category ON swap_listings(category);
CREATE INDEX IF NOT EXISTS idx_swap_listings_status ON swap_listings(status);
CREATE INDEX IF NOT EXISTS idx_swap_listings_location ON swap_listings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_swap_listings_flash_swap ON swap_listings(is_flash_swap, expires_at);

-- Insert a test listing if none exist
INSERT INTO swap_listings (
    user_id, 
    title, 
    description, 
    category, 
    subcategory, 
    estimated_value, 
    condition, 
    location,
    latitude,
    longitude,
    wanted_items,
    ai_tags
) 
SELECT 
    (SELECT id FROM users LIMIT 1),
    'Test MacBook Pro for Gaming Setup',
    'This is a test listing created automatically. Trading my MacBook Pro for a gaming setup.',
    'physical',
    'Electronics',
    2500.00,
    'like-new',
    'San Francisco, CA',
    37.7749,
    -122.4194,
    ARRAY['Gaming PC', 'RTX 4070', 'Gaming Setup'],
    ARRAY['laptop', 'apple', 'macbook', 'electronics']
WHERE NOT EXISTS (SELECT 1 FROM swap_listings LIMIT 1);
