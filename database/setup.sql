-- Create the classification table
CREATE TABLE IF NOT EXISTS public.classification (
    classification_id SERIAL PRIMARY KEY,
    classification_name VARCHAR(50) NOT NULL UNIQUE  -- UNIQUE to prevent duplicates, as implied by your app logic
);

-- Create the inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
    inv_id SERIAL PRIMARY KEY,
    inv_make VARCHAR(50) NOT NULL,
    inv_model VARCHAR(50) NOT NULL,
    inv_description TEXT,  -- TEXT for longer descriptions
    inv_image VARCHAR(255),  -- Assuming URLs or paths
    inv_thumbnail VARCHAR(255),
    inv_price DECIMAL(10, 2) NOT NULL,  -- DECIMAL for prices
    inv_year INT NOT NULL,
    inv_miles INT NOT NULL,
    inv_color VARCHAR(50),
    classification_id INT NOT NULL,
    FOREIGN KEY (classification_id) REFERENCES public.classification(classification_id) ON DELETE CASCADE
);

-- Optional: Insert some sample data for testing
INSERT INTO public.classification (classification_name) VALUES ('SUV'), ('Truck'), ('Sedan') ON CONFLICT DO NOTHING;
INSERT INTO public.inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id) 
VALUES ('Toyota', 'RAV4', 'A reliable SUV', '/images/rav4.jpg', '/images/rav4-thumb.jpg', 25000.00, 2022, 15000, 'Blue', 1) ON CONFLICT DO NOTHING;