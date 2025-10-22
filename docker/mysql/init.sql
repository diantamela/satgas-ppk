-- MySQL initialization script for satgas-ppk
-- This file is executed when the MySQL container starts for the first time

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS satgas_ppk;

-- Use the database
USE satgas_ppk;

-- Create tables will be handled by Drizzle ORM migrations