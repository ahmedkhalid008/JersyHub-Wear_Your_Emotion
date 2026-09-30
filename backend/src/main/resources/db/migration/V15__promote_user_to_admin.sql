-- Safe idempotent migration to promote user 04324205191008@uits.edu.bd to ADMIN role if present

UPDATE users
SET role = 'ADMIN',
    updated_at = CURRENT_TIMESTAMP
WHERE email = '04324205191008@uits.edu.bd';
