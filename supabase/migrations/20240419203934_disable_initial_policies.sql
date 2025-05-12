-- Migration: Disable Initial RLS Policies
-- Description: Disables all RLS policies created in migration 20240419202826_create_initial_schema.sql
-- Author: AI Assistant
-- Date: 2024-04-19

-- Disable Flashcards Policies
drop policy "No access for anon users on flashcards" on flashcards;
drop policy "Users can view own flashcards" on flashcards;
drop policy "Users can insert own flashcards" on flashcards;
drop policy "Users can update own flashcards" on flashcards;
drop policy "Users can delete own flashcards" on flashcards;

-- Disable Generations Policies
drop policy "No access for anon users on generations" on generations;
drop policy "Users can view own generations" on generations;
drop policy "Users can insert own generations" on generations;
drop policy "Users can update own generations" on generations;

-- Disable Generation Logs Policies
drop policy "No access for anon users on generation_logs" on generation_logs;
drop policy "Users can view own generation logs" on generation_logs;
drop policy "Users can insert own generation logs" on generation_logs; 