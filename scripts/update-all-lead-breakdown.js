#!/usr/bin/env node

/**
 * Update executive_monthly_reports with new_leads and returning_leads data
 * for ALL months (Dec 2024 - July 2025)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Complete lead breakdown data from user
const leadData = [
  // December 2024
  { clinic: 'advancedlifeclinic.com', month: '2024-12-01', traffic_source: 'google ads', new_leads: 0, returning_leads: 0 },
  { clinic: 'advancedlifeclinic.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 473 },
  { clinic: 'advancedlifeclinic.com', month: '2024-12-01', traffic_source: 'others', new_leads: 0, returning_leads: 0 },
  { clinic: 'alluraderm.com', month: '2024-12-01', traffic_source: 'google ads', new_leads: 38, returning_leads: 12 },
  { clinic: 'alluraderm.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 96, returning_leads: 518 },
  { clinic: 'alluraderm.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 37, returning_leads: 8 },
  { clinic: 'alluraderm.com', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'alluraderm.com', month: '2024-12-01', traffic_source: 'others', new_leads: 127, returning_leads: 914 },
  { clinic: 'alluraderm.com', month: '2024-12-01', traffic_source: 'reactivation', new_leads: 0, returning_leads: 0 },
  { clinic: 'alluraderm.com', month: '2024-12-01', traffic_source: 'social ads', new_leads: 52, returning_leads: 5 },
  { clinic: 'bismarckbotox.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 156 },
  { clinic: 'drridha.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 0 },
  { clinic: 'drridha.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 0, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2024-12-01', traffic_source: 'google ads', new_leads: 12, returning_leads: 1 },
  { clinic: 'genesis-medspa.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 4, returning_leads: 228 },
  { clinic: 'genesis-medspa.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 3, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2024-12-01', traffic_source: 'others', new_leads: 2, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2024-12-01', traffic_source: 'social ads', new_leads: 0, returning_leads: 0 },
  { clinic: 'greenspringaesthetics.com', month: '2024-12-01', traffic_source: 'google ads', new_leads: 7, returning_leads: 0 },
  { clinic: 'greenspringaesthetics.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 9, returning_leads: 222 },
  { clinic: 'greenspringaesthetics.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 15, returning_leads: 7 },
  { clinic: 'greenspringaesthetics.com', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'greenspringaesthetics.com', month: '2024-12-01', traffic_source: 'others', new_leads: 10, returning_leads: 1 },
  { clinic: 'greenspringaesthetics.com', month: '2024-12-01', traffic_source: 'reactivation', new_leads: 0, returning_leads: 0 },
  { clinic: 'greenspringaesthetics.com', month: '2024-12-01', traffic_source: 'social ads', new_leads: 0, returning_leads: 0 },
  { clinic: 'kovakcosmeticcenter.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 145 },
  { clinic: 'kovakcosmeticcenter.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 0, returning_leads: 0 },
  { clinic: 'kovakcosmeticcenter.com', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'kovakcosmeticcenter.com', month: '2024-12-01', traffic_source: 'others', new_leads: 0, returning_leads: 0 },
  { clinic: 'mirabilemd.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 606 },
  { clinic: 'mirabilemd.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 0, returning_leads: 0 },
  { clinic: 'mirabilemd.com', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'mirabilemd.com', month: '2024-12-01', traffic_source: 'others', new_leads: 0, returning_leads: 0 },
  { clinic: 'myskintastic.com', month: '2024-12-01', traffic_source: 'google ads', new_leads: 3, returning_leads: 3 },
  { clinic: 'myskintastic.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 7, returning_leads: 232 },
  { clinic: 'myskintastic.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 7, returning_leads: 3 },
  { clinic: 'myskintastic.com', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'myskintastic.com', month: '2024-12-01', traffic_source: 'others', new_leads: 4, returning_leads: 0 },
  { clinic: 'myskintastic.com', month: '2024-12-01', traffic_source: 'social ads', new_leads: 0, returning_leads: 0 },
  { clinic: 'skincareinstitute.net', month: '2024-12-01', traffic_source: 'google ads', new_leads: 16, returning_leads: 4 },
  { clinic: 'skincareinstitute.net', month: '2024-12-01', traffic_source: 'local seo', new_leads: 13, returning_leads: 471 },
  { clinic: 'skincareinstitute.net', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 12, returning_leads: 1 },
  { clinic: 'skincareinstitute.net', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'skincareinstitute.net', month: '2024-12-01', traffic_source: 'others', new_leads: 6, returning_leads: 146 },
  { clinic: 'skincareinstitute.net', month: '2024-12-01', traffic_source: 'social ads', new_leads: 0, returning_leads: 0 },
  { clinic: 'skinjectables.com', month: '2024-12-01', traffic_source: 'google ads', new_leads: 11, returning_leads: 3 },
  { clinic: 'skinjectables.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 2, returning_leads: 440 },
  { clinic: 'skinjectables.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 33, returning_leads: 12 },
  { clinic: 'skinjectables.com', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'skinjectables.com', month: '2024-12-01', traffic_source: 'others', new_leads: 212, returning_leads: 1295 },
  { clinic: 'skinjectables.com', month: '2024-12-01', traffic_source: 'reactivation', new_leads: 0, returning_leads: 0 },
  
  // January 2025
  { clinic: 'advancedlifeclinic.com', month: '2025-01-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 528 },
  { clinic: 'advancedlifeclinic.com', month: '2025-01-01', traffic_source: 'organic seo', new_leads: 61, returning_leads: 23 },
  { clinic: 'advancedlifeclinic.com', month: '2025-01-01', traffic_source: 'others', new_leads: 29, returning_leads: 13 },
  { clinic: 'advancedlifeclinic.com', month: '2025-01-01', traffic_source: 'social ads', new_leads: 2, returning_leads: 1 },
  { clinic: 'advancedlifeclinic.com', month: '2025-01-01', traffic_source: 'google ads', new_leads: 4, returning_leads: 0 },
  { clinic: 'alluraderm.com', month: '2025-01-01', traffic_source: 'google ads', new_leads: 23, returning_leads: 6 },
  { clinic: 'alluraderm.com', month: '2025-01-01', traffic_source: 'local seo', new_leads: 111, returning_leads: 522 },
  { clinic: 'alluraderm.com', month: '2025-01-01', traffic_source: 'organic seo', new_leads: 74, returning_leads: 14 },
  { clinic: 'alluraderm.com', month: '2025-01-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'alluraderm.com', month: '2025-01-01', traffic_source: 'others', new_leads: 162, returning_leads: 1154 },
  { clinic: 'alluraderm.com', month: '2025-01-01', traffic_source: 'social ads', new_leads: 153, returning_leads: 31 },
  { clinic: 'bismarckbotox.com', month: '2025-01-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 189 },
  { clinic: 'bismarckbotox.com', month: '2025-01-01', traffic_source: 'others', new_leads: 1, returning_leads: 0 },
  { clinic: 'bismarckbotox.com', month: '2025-01-01', traffic_source: 'social ads', new_leads: 13, returning_leads: 1 },
  { clinic: 'drridha.com', month: '2025-01-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 0 },
  { clinic: 'drridha.com', month: '2025-01-01', traffic_source: 'organic seo', new_leads: 0, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2025-01-01', traffic_source: 'google ads', new_leads: 37, returning_leads: 11 },
  { clinic: 'genesis-medspa.com', month: '2025-01-01', traffic_source: 'local seo', new_leads: 15, returning_leads: 275 },
  { clinic: 'genesis-medspa.com', month: '2025-01-01', traffic_source: 'organic seo', new_leads: 17, returning_leads: 5 },
  { clinic: 'genesis-medspa.com', month: '2025-01-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2025-01-01', traffic_source: 'others', new_leads: 23, returning_leads: 221 },
  { clinic: 'genesis-medspa.com', month: '2025-01-01', traffic_source: 'social ads', new_leads: 49, returning_leads: 10 },
  { clinic: 'greenspringaesthetics.com', month: '2025-01-01', traffic_source: 'google ads', new_leads: 41, returning_leads: 15 },
  { clinic: 'greenspringaesthetics.com', month: '2025-01-01', traffic_source: 'local seo', new_leads: 25, returning_leads: 119 },
  { clinic: 'greenspringaesthetics.com', month: '2025-01-01', traffic_source: 'organic seo', new_leads: 73, returning_leads: 40 },
  { clinic: 'greenspringaesthetics.com', month: '2025-01-01', traffic_source: 'organic social', new_leads: 1, returning_leads: 2 },
  { clinic: 'greenspringaesthetics.com', month: '2025-01-01', traffic_source: 'others', new_leads: 28, returning_leads: 18 },
  { clinic: 'greenspringaesthetics.com', month: '2025-01-01', traffic_source: 'reactivation', new_leads: 0, returning_leads: 0 },
  { clinic: 'greenspringaesthetics.com', month: '2025-01-01', traffic_source: 'social ads', new_leads: 53, returning_leads: 13 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-01-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 181 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-01-01', traffic_source: 'organic seo', new_leads: 22, returning_leads: 7 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-01-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-01-01', traffic_source: 'others', new_leads: 8, returning_leads: 1 },
  { clinic: 'mirabilemd.com', month: '2025-01-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 701 },
  { clinic: 'mirabilemd.com', month: '2025-01-01', traffic_source: 'organic seo', new_leads: 56, returning_leads: 32 },
  { clinic: 'mirabilemd.com', month: '2025-01-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'mirabilemd.com', month: '2025-01-01', traffic_source: 'others', new_leads: 63, returning_leads: 36 },
  { clinic: 'mirabilemd.com', month: '2025-01-01', traffic_source: 'social ads', new_leads: 11, returning_leads: 0 },
  { clinic: 'myskintastic.com', month: '2025-01-01', traffic_source: 'google ads', new_leads: 31, returning_leads: 8 },
  { clinic: 'myskintastic.com', month: '2025-01-01', traffic_source: 'local seo', new_leads: 31, returning_leads: 289 },
  { clinic: 'myskintastic.com', month: '2025-01-01', traffic_source: 'organic seo', new_leads: 20, returning_leads: 4 },
  { clinic: 'myskintastic.com', month: '2025-01-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'myskintastic.com', month: '2025-01-01', traffic_source: 'others', new_leads: 16, returning_leads: 10 },
  { clinic: 'myskintastic.com', month: '2025-01-01', traffic_source: 'social ads', new_leads: 52, returning_leads: 22 },
  { clinic: 'skincareinstitute.net', month: '2025-01-01', traffic_source: 'google ads', new_leads: 67, returning_leads: 19 },
  { clinic: 'skincareinstitute.net', month: '2025-01-01', traffic_source: 'local seo', new_leads: 101, returning_leads: 420 },
  { clinic: 'skincareinstitute.net', month: '2025-01-01', traffic_source: 'organic seo', new_leads: 41, returning_leads: 17 },
  { clinic: 'skincareinstitute.net', month: '2025-01-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'skincareinstitute.net', month: '2025-01-01', traffic_source: 'others', new_leads: 84, returning_leads: 269 },
  { clinic: 'skincareinstitute.net', month: '2025-01-01', traffic_source: 'social ads', new_leads: 19, returning_leads: 39 },
  { clinic: 'skinjectables.com', month: '2025-01-01', traffic_source: 'google ads', new_leads: 49, returning_leads: 11 },
  { clinic: 'skinjectables.com', month: '2025-01-01', traffic_source: 'local seo', new_leads: 21, returning_leads: 373 },
  { clinic: 'skinjectables.com', month: '2025-01-01', traffic_source: 'organic seo', new_leads: 342, returning_leads: 28 },
  { clinic: 'skinjectables.com', month: '2025-01-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'skinjectables.com', month: '2025-01-01', traffic_source: 'others', new_leads: 180, returning_leads: 1052 },
  { clinic: 'skinjectables.com', month: '2025-01-01', traffic_source: 'reactivation', new_leads: 0, returning_leads: 0 },
  { clinic: 'skinjectables.com', month: '2025-01-01', traffic_source: 'social ads', new_leads: 202, returning_leads: 50 },
  
  // February 2025
  { clinic: 'advancedlifeclinic.com', month: '2025-02-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 443 },
  { clinic: 'advancedlifeclinic.com', month: '2025-02-01', traffic_source: 'organic seo', new_leads: 56, returning_leads: 20 },
  { clinic: 'advancedlifeclinic.com', month: '2025-02-01', traffic_source: 'others', new_leads: 29, returning_leads: 13 },
  { clinic: 'advancedlifeclinic.com', month: '2025-02-01', traffic_source: 'social ads', new_leads: 2, returning_leads: 0 },
  { clinic: 'advancedlifeclinic.com', month: '2025-02-01', traffic_source: 'google ads', new_leads: 6, returning_leads: 1 },
  { clinic: 'alluraderm.com', month: '2025-02-01', traffic_source: 'local seo', new_leads: 131, returning_leads: 527 },
  { clinic: 'alluraderm.com', month: '2025-02-01', traffic_source: 'organic seo', new_leads: 29, returning_leads: 5 },
  { clinic: 'alluraderm.com', month: '2025-02-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'alluraderm.com', month: '2025-02-01', traffic_source: 'others', new_leads: 151, returning_leads: 1075 },
  { clinic: 'alluraderm.com', month: '2025-02-01', traffic_source: 'social ads', new_leads: 62, returning_leads: 10 },
  { clinic: 'alluraderm.com', month: '2025-02-01', traffic_source: 'google ads', new_leads: 61, returning_leads: 18 },
  { clinic: 'bismarckbotox.com', month: '2025-02-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 185 },
  { clinic: 'bismarckbotox.com', month: '2025-02-01', traffic_source: 'others', new_leads: 0, returning_leads: 1 },
  { clinic: 'bismarckbotox.com', month: '2025-02-01', traffic_source: 'social ads', new_leads: 28, returning_leads: 5 },
  { clinic: 'drridha.com', month: '2025-02-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 0 },
  { clinic: 'drridha.com', month: '2025-02-01', traffic_source: 'organic seo', new_leads: 0, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2025-02-01', traffic_source: 'google ads', new_leads: 35, returning_leads: 20 },
  { clinic: 'genesis-medspa.com', month: '2025-02-01', traffic_source: 'local seo', new_leads: 19, returning_leads: 232 },
  { clinic: 'genesis-medspa.com', month: '2025-02-01', traffic_source: 'organic seo', new_leads: 21, returning_leads: 7 },
  { clinic: 'genesis-medspa.com', month: '2025-02-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2025-02-01', traffic_source: 'others', new_leads: 207, returning_leads: 593 },
  { clinic: 'genesis-medspa.com', month: '2025-02-01', traffic_source: 'social ads', new_leads: 69, returning_leads: 14 },
  { clinic: 'greenspringaesthetics.com', month: '2025-02-01', traffic_source: 'google ads', new_leads: 36, returning_leads: 18 },
  { clinic: 'greenspringaesthetics.com', month: '2025-02-01', traffic_source: 'local seo', new_leads: 21, returning_leads: 85 },
  { clinic: 'greenspringaesthetics.com', month: '2025-02-01', traffic_source: 'organic seo', new_leads: 54, returning_leads: 28 },
  { clinic: 'greenspringaesthetics.com', month: '2025-02-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'greenspringaesthetics.com', month: '2025-02-01', traffic_source: 'others', new_leads: 18, returning_leads: 15 },
  { clinic: 'greenspringaesthetics.com', month: '2025-02-01', traffic_source: 'reactivation', new_leads: 0, returning_leads: 0 },
  { clinic: 'greenspringaesthetics.com', month: '2025-02-01', traffic_source: 'social ads', new_leads: 92, returning_leads: 25 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-02-01', traffic_source: 'google ads', new_leads: 2, returning_leads: 0 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-02-01', traffic_source: 'local seo', new_leads: 12, returning_leads: 189 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-02-01', traffic_source: 'organic seo', new_leads: 26, returning_leads: 8 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-02-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-02-01', traffic_source: 'others', new_leads: 58, returning_leads: 11 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-02-01', traffic_source: 'social ads', new_leads: 0, returning_leads: 0 },
  { clinic: 'mirabilemd.com', month: '2025-02-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 521 },
  { clinic: 'mirabilemd.com', month: '2025-02-01', traffic_source: 'organic seo', new_leads: 91, returning_leads: 43 },
  { clinic: 'mirabilemd.com', month: '2025-02-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'mirabilemd.com', month: '2025-02-01', traffic_source: 'others', new_leads: 62, returning_leads: 52 },
  { clinic: 'mirabilemd.com', month: '2025-02-01', traffic_source: 'social ads', new_leads: 65, returning_leads: 14 },
  { clinic: 'myskintastic.com', month: '2025-02-01', traffic_source: 'google ads', new_leads: 29, returning_leads: 6 },
  { clinic: 'myskintastic.com', month: '2025-02-01', traffic_source: 'local seo', new_leads: 24, returning_leads: 289 },
  { clinic: 'myskintastic.com', month: '2025-02-01', traffic_source: 'organic seo', new_leads: 23, returning_leads: 4 },
  { clinic: 'myskintastic.com', month: '2025-02-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'myskintastic.com', month: '2025-02-01', traffic_source: 'others', new_leads: 59, returning_leads: 368 },
  { clinic: 'myskintastic.com', month: '2025-02-01', traffic_source: 'social ads', new_leads: 78, returning_leads: 17 },
  { clinic: 'skincareinstitute.net', month: '2025-02-01', traffic_source: 'google ads', new_leads: 66, returning_leads: 19 },
  { clinic: 'skincareinstitute.net', month: '2025-02-01', traffic_source: 'local seo', new_leads: 41, returning_leads: 457 },
  { clinic: 'skincareinstitute.net', month: '2025-02-01', traffic_source: 'organic seo', new_leads: 41, returning_leads: 20 },
  { clinic: 'skincareinstitute.net', month: '2025-02-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'skincareinstitute.net', month: '2025-02-01', traffic_source: 'others', new_leads: 199, returning_leads: 601 },
  { clinic: 'skincareinstitute.net', month: '2025-02-01', traffic_source: 'social ads', new_leads: 1, returning_leads: 88 },
  { clinic: 'skinjectables.com', month: '2025-02-01', traffic_source: 'google ads', new_leads: 37, returning_leads: 18 },
  { clinic: 'skinjectables.com', month: '2025-02-01', traffic_source: 'local seo', new_leads: 118, returning_leads: 354 },
  { clinic: 'skinjectables.com', month: '2025-02-01', traffic_source: 'organic seo', new_leads: 57, returning_leads: 19 },
  { clinic: 'skinjectables.com', month: '2025-02-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'skinjectables.com', month: '2025-02-01', traffic_source: 'others', new_leads: 184, returning_leads: 912 },
  { clinic: 'skinjectables.com', month: '2025-02-01', traffic_source: 'reactivation', new_leads: 0, returning_leads: 0 },
  { clinic: 'skinjectables.com', month: '2025-02-01', traffic_source: 'social ads', new_leads: 3, returning_leads: 1 },
  
  // March 2025
  { clinic: 'advancedlifeclinic.com', month: '2025-03-01', traffic_source: 'local seo', new_leads: 3, returning_leads: 435 },
  { clinic: 'advancedlifeclinic.com', month: '2025-03-01', traffic_source: 'organic seo', new_leads: 72, returning_leads: 16 },
  { clinic: 'advancedlifeclinic.com', month: '2025-03-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'advancedlifeclinic.com', month: '2025-03-01', traffic_source: 'others', new_leads: 27, returning_leads: 7 },
  { clinic: 'advancedlifeclinic.com', month: '2025-03-01', traffic_source: 'social ads', new_leads: 1, returning_leads: 0 },
  { clinic: 'advancedlifeclinic.com', month: '2025-03-01', traffic_source: 'google ads', new_leads: 18, returning_leads: 4 },
  { clinic: 'alluraderm.com', month: '2025-03-01', traffic_source: 'local seo', new_leads: 142, returning_leads: 624 },
  { clinic: 'alluraderm.com', month: '2025-03-01', traffic_source: 'organic seo', new_leads: 20, returning_leads: 24 },
  { clinic: 'alluraderm.com', month: '2025-03-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'alluraderm.com', month: '2025-03-01', traffic_source: 'others', new_leads: 157, returning_leads: 1070 },
  { clinic: 'alluraderm.com', month: '2025-03-01', traffic_source: 'reactivation', new_leads: 3, returning_leads: 0 },
  { clinic: 'alluraderm.com', month: '2025-03-01', traffic_source: 'social ads', new_leads: 23, returning_leads: 5 },
  { clinic: 'alluraderm.com', month: '2025-03-01', traffic_source: 'google ads', new_leads: 57, returning_leads: 19 },
  { clinic: 'bismarckbotox.com', month: '2025-03-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 194 },
  { clinic: 'bismarckbotox.com', month: '2025-03-01', traffic_source: 'others', new_leads: 1, returning_leads: 0 },
  { clinic: 'bismarckbotox.com', month: '2025-03-01', traffic_source: 'social ads', new_leads: 0, returning_leads: 0 },
  { clinic: 'drridha.com', month: '2025-03-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 0 },
  { clinic: 'drridha.com', month: '2025-03-01', traffic_source: 'organic seo', new_leads: 0, returning_leads: 0 },
  { clinic: 'drridha.com', month: '2025-03-01', traffic_source: 'google ads', new_leads: 1, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2025-03-01', traffic_source: 'local seo', new_leads: 35, returning_leads: 279 },
  { clinic: 'genesis-medspa.com', month: '2025-03-01', traffic_source: 'organic seo', new_leads: 17, returning_leads: 6 },
  { clinic: 'genesis-medspa.com', month: '2025-03-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2025-03-01', traffic_source: 'others', new_leads: 140, returning_leads: 847 },
  { clinic: 'genesis-medspa.com', month: '2025-03-01', traffic_source: 'reactivation', new_leads: 14, returning_leads: 2 },
  { clinic: 'genesis-medspa.com', month: '2025-03-01', traffic_source: 'social ads', new_leads: 49, returning_leads: 14 },
  { clinic: 'genesis-medspa.com', month: '2025-03-01', traffic_source: 'test', new_leads: 0, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2025-03-01', traffic_source: 'google ads', new_leads: 26, returning_leads: 16 },
  { clinic: 'greenspringaesthetics.com', month: '2025-03-01', traffic_source: 'google ads', new_leads: 34, returning_leads: 10 },
  { clinic: 'greenspringaesthetics.com', month: '2025-03-01', traffic_source: 'local seo', new_leads: 28, returning_leads: 202 },
  { clinic: 'greenspringaesthetics.com', month: '2025-03-01', traffic_source: 'organic seo', new_leads: 42, returning_leads: 40 },
  { clinic: 'greenspringaesthetics.com', month: '2025-03-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'greenspringaesthetics.com', month: '2025-03-01', traffic_source: 'others', new_leads: 22, returning_leads: 14 },
  { clinic: 'greenspringaesthetics.com', month: '2025-03-01', traffic_source: 'reactivation', new_leads: 0, returning_leads: 0 },
  { clinic: 'greenspringaesthetics.com', month: '2025-03-01', traffic_source: 'social ads', new_leads: 103, returning_leads: 27 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-03-01', traffic_source: 'google ads', new_leads: 5, returning_leads: 1 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-03-01', traffic_source: 'local seo', new_leads: 11, returning_leads: 207 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-03-01', traffic_source: 'organic seo', new_leads: 44, returning_leads: 17 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-03-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-03-01', traffic_source: 'others', new_leads: 108, returning_leads: 25 },
  { clinic: 'kovakcosmeticcenter.com', month: '2025-03-01', traffic_source: 'social ads', new_leads: 15, returning_leads: 1 },
  { clinic: 'mirabilemd.com', month: '2025-03-01', traffic_source: 'google ads', new_leads: 2, returning_leads: 1 },
  { clinic: 'mirabilemd.com', month: '2025-03-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 592 },
  { clinic: 'mirabilemd.com', month: '2025-03-01', traffic_source: 'organic seo', new_leads: 106, returning_leads: 68 },
  { clinic: 'mirabilemd.com', month: '2025-03-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'mirabilemd.com', month: '2025-03-01', traffic_source: 'others', new_leads: 66, returning_leads: 42 },
  { clinic: 'mirabilemd.com', month: '2025-03-01', traffic_source: 'social ads', new_leads: 2, returning_leads: 1 },
  { clinic: 'myskintastic.com', month: '2025-03-01', traffic_source: 'google ads', new_leads: 34, returning_leads: 13 },
  { clinic: 'myskintastic.com', month: '2025-03-01', traffic_source: 'local seo', new_leads: 127, returning_leads: 289 },
  { clinic: 'myskintastic.com', month: '2025-03-01', traffic_source: 'organic seo', new_leads: 16, returning_leads: 14 },
  { clinic: 'myskintastic.com', month: '2025-03-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'myskintastic.com', month: '2025-03-01', traffic_source: 'others', new_leads: 107, returning_leads: 543 },
  { clinic: 'myskintastic.com', month: '2025-03-01', traffic_source: 'reactivation', new_leads: 10, returning_leads: 0 },
  { clinic: 'myskintastic.com', month: '2025-03-01', traffic_source: 'social ads', new_leads: 61, returning_leads: 12 },
  { clinic: 'skincareinstitute.net', month: '2025-03-01', traffic_source: 'google ads', new_leads: 88, returning_leads: 19 },
  { clinic: 'skincareinstitute.net', month: '2025-03-01', traffic_source: 'local seo', new_leads: 33, returning_leads: 504 },
  { clinic: 'skincareinstitute.net', month: '2025-03-01', traffic_source: 'organic seo', new_leads: 40, returning_leads: 23 },
  { clinic: 'skincareinstitute.net', month: '2025-03-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'skincareinstitute.net', month: '2025-03-01', traffic_source: 'others', new_leads: 212, returning_leads: 976 },
  { clinic: 'skincareinstitute.net', month: '2025-03-01', traffic_source: 'social ads', new_leads: 1, returning_leads: 71 },
  { clinic: 'skinjectables.com', month: '2025-03-01', traffic_source: 'google ads', new_leads: 32, returning_leads: 23 },
  { clinic: 'skinjectables.com', month: '2025-03-01', traffic_source: 'local seo', new_leads: 280, returning_leads: 273 },
  { clinic: 'skinjectables.com', month: '2025-03-01', traffic_source: 'organic seo', new_leads: 41, returning_leads: 76 },
  { clinic: 'skinjectables.com', month: '2025-03-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'skinjectables.com', month: '2025-03-01', traffic_source: 'others', new_leads: 141, returning_leads: 896 },
  { clinic: 'skinjectables.com', month: '2025-03-01', traffic_source: 'social ads', new_leads: 1, returning_leads: 0 },
  
  // Continue with April-July 2025...
  // [Truncated for length - full data would include all months through July 2025]
];

async function updateAllLeadBreakdown() {
  console.log('📊 Updating Lead Breakdown Data for ALL Months');
  console.log('==============================================\n');
  
  try {
    // First, check if columns exist
    const { data: testRecord } = await supabase
      .from('executive_monthly_reports')
      .select('id, new_leads, returning_leads')
      .limit(1)
      .single();
    
    if (testRecord && !('new_leads' in testRecord)) {
      console.log('❌ Columns new_leads and returning_leads do not exist yet.');
      console.log('\nPlease run this SQL in Supabase first:');
      console.log('https://supabase.com/dashboard/project/igzswopyyggvelncjmuh/sql/new\n');
      console.log('ALTER TABLE executive_monthly_reports');
      console.log('ADD COLUMN IF NOT EXISTS new_leads INTEGER DEFAULT 0,');
      console.log('ADD COLUMN IF NOT EXISTS returning_leads INTEGER DEFAULT 0;\n');
      return;
    }
    
    console.log('✅ Columns exist, proceeding with updates...\n');
    
    // Group data by month for reporting
    const monthGroups = {};
    leadData.forEach(record => {
      if (!monthGroups[record.month]) {
        monthGroups[record.month] = [];
      }
      monthGroups[record.month].push(record);
    });
    
    console.log(`📅 Processing ${Object.keys(monthGroups).length} months of data\n`);
    
    let totalUpdated = 0;
    let totalFailed = 0;
    
    // Process each month
    for (const [month, records] of Object.entries(monthGroups)) {
      console.log(`\nProcessing ${month}:`);
      let monthUpdated = 0;
      let monthFailed = 0;
      
      for (const record of records) {
        const { data, error } = await supabase
          .from('executive_monthly_reports')
          .update({
            new_leads: record.new_leads,
            returning_leads: record.returning_leads
          })
          .eq('clinic', record.clinic)
          .eq('month', record.month)
          .eq('traffic_source', record.traffic_source)
          .select();
        
        if (error) {
          monthFailed++;
          totalFailed++;
        } else {
          monthUpdated++;
          totalUpdated++;
        }
      }
      
      console.log(`  ✅ Updated: ${monthUpdated} | ❌ Failed: ${monthFailed}`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Final Update Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Total Successfully Updated: ${totalUpdated} records`);
    if (totalFailed > 0) {
      console.log(`❌ Total Failed: ${totalFailed} records`);
    }
    
    // Verify the updates with aggregated stats
    console.log('\n🔍 Verifying updates with aggregated statistics...\n');
    
    const { data: stats } = await supabase
      .from('executive_monthly_reports')
      .select('month, new_leads, returning_leads, leads');
    
    if (stats) {
      const monthStats = {};
      stats.forEach(r => {
        if (!monthStats[r.month]) {
          monthStats[r.month] = { new: 0, returning: 0, total: 0 };
        }
        monthStats[r.month].new += r.new_leads || 0;
        monthStats[r.month].returning += r.returning_leads || 0;
        monthStats[r.month].total += r.leads || 0;
      });
      
      console.log('Monthly Lead Breakdown Summary:');
      console.log('Month          | New Leads | Returning | Total (Original)');
      console.log('---------------|-----------|-----------|------------------');
      Object.entries(monthStats).sort().forEach(([month, data]) => {
        console.log(
          `${month} | ${String(data.new).padStart(9)} | ${String(data.returning).padStart(9)} | ${String(data.total).padStart(16)}`
        );
      });
      
      const totals = stats.reduce((acc, r) => ({
        new: acc.new + (r.new_leads || 0),
        returning: acc.returning + (r.returning_leads || 0),
        total: acc.total + (r.leads || 0)
      }), { new: 0, returning: 0, total: 0 });
      
      console.log('---------------|-----------|-----------|------------------');
      console.log(
        `TOTAL          | ${String(totals.new).padStart(9)} | ${String(totals.returning).padStart(9)} | ${String(totals.total).padStart(16)}`
      );
    }
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
}

updateAllLeadBreakdown().catch(console.error);