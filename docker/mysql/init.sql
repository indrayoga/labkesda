-- Create database
CREATE DATABASE IF NOT EXISTS laravel
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create DEV user (akses dari mana saja)
CREATE USER IF NOT EXISTS 'laravel'@'%' 
IDENTIFIED BY 'laravel';

-- Grant full access (DEV only)
GRANT ALL PRIVILEGES ON laravel.* TO 'laravel'@'%';

FLUSH PRIVILEGES;
