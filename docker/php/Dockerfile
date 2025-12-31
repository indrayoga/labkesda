FROM php:8.4-fpm

# System deps
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    gnupg \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    && docker-php-ext-install pdo pdo_mysql zip gd

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy app source
COPY . .

# Permission
RUN chown -R www-data:www-data storage bootstrap/cache
RUN chmod -R 777 storage bootstrap/cache

# Copy deps first
# COPY composer.json composer.lock ./
RUN composer install

# Install Node.js LTS (24)
# RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
#     && apt-get install -y nodejs

# COPY package.json package-lock.json ./
# RUN npm install


EXPOSE 9000
