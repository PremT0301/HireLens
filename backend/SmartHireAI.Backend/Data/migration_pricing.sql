ALTER TABLE users ADD COLUMN pricing_plan VARCHAR(20) NOT NULL DEFAULT 'FREE';

CREATE TABLE usage_tracking (
    usage_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    feature_name VARCHAR(50) NOT NULL,
    usage_count INT NOT NULL DEFAULT 0,
    week_reset_date DATETIME(6) NOT NULL,
    CONSTRAINT FK_usage_tracking_users_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

UPDATE users SET pricing_plan = 'FREE' WHERE email = 'pt.200332@gmail.com';
UPDATE users SET pricing_plan = 'PRO' WHERE email = 'prem.200205@gmail.com';
UPDATE users SET pricing_plan = 'ELITE_PLUS' WHERE email = 'gptchatcoffee@gmail.com';
