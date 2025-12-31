-- Create database
CREATE DATABASE IF NOT EXISTS db_labkesda
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create DEV user (akses dari mana saja)
CREATE USER IF NOT EXISTS 'labkesda'@'%'
IDENTIFIED BY 'L4bk3sd4';

-- Grant full access (DEV only)
GRANT ALL PRIVILEGES ON db_labkesda.* TO 'labkesda'@'%';

FLUSH PRIVILEGES;
