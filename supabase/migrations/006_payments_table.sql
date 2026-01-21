-- ============================================
-- Migration: 006_payments_table
-- Description: Payments table
-- ============================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    
    -- Amount Details
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    convenience_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment Method
    method TEXT NOT NULL CHECK (method IN ('online', 'offline', 'free')),
    
    -- Status Flow: pending -> processing -> success | failed -> refunded
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'refunded', 'partially_refunded')),
    
    -- Razorpay Details
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    gateway_response JSONB,
    
    -- Receipt
    receipt_number TEXT,
    receipt_url TEXT,
    
    -- Offline Payment
    offline_verified_by UUID REFERENCES profiles(id),
    offline_verification_note TEXT,
    offline_verified_at TIMESTAMPTZ,
    
    -- Refund Details
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    refund_id TEXT,
    refund_processed_by UUID REFERENCES profiles(id),
    refund_processed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_refund CHECK (refund_amount IS NULL OR refund_amount <= total_amount)
);

-- Indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_registration_id ON payments(registration_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE UNIQUE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE UNIQUE INDEX idx_payments_razorpay_payment_id ON payments(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE UNIQUE INDEX idx_payments_receipt_number ON payments(receipt_number) WHERE receipt_number IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER set_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Sequence table for receipt numbers (prevents race conditions)
CREATE TABLE IF NOT EXISTS receipt_sequences (
    year_suffix TEXT PRIMARY KEY,
    last_seq INTEGER NOT NULL DEFAULT 0
);

-- Function to generate receipt number with row-level locking
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
    year_suffix TEXT;
    seq_num INTEGER;
BEGIN
    IF NEW.status = 'success' AND NEW.receipt_number IS NULL THEN
        year_suffix := to_char(now(), 'YY');
        
        -- Try to lock existing row or insert new one
        INSERT INTO receipt_sequences (year_suffix, last_seq)
        VALUES (year_suffix, 0)
        ON CONFLICT (year_suffix) DO NOTHING;
        
        -- Select with row-level lock and increment
        UPDATE receipt_sequences
        SET last_seq = last_seq + 1
        WHERE receipt_sequences.year_suffix = generate_receipt_number.year_suffix
        RETURNING last_seq INTO seq_num;
        
        NEW.receipt_number := 'RCP-' || year_suffix || '-' || lpad(seq_num::TEXT, 6, '0');
        NEW.completed_at := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for receipt number generation
CREATE TRIGGER generate_payment_receipt_number
    BEFORE INSERT OR UPDATE OF status ON payments
    FOR EACH ROW
    EXECUTE FUNCTION generate_receipt_number();

-- Function to sync payment status to registration
CREATE OR REPLACE FUNCTION sync_registration_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'success' THEN
        UPDATE registrations 
        SET payment_status = 'completed',
            status = 'confirmed',
            amount_paid = NEW.total_amount
        WHERE id = NEW.registration_id;
    ELSIF NEW.status = 'failed' THEN
        UPDATE registrations 
        SET payment_status = 'failed'
        WHERE id = NEW.registration_id;
    ELSIF NEW.status = 'refunded' THEN
        UPDATE registrations 
        SET payment_status = 'refunded',
            status = 'cancelled'
        WHERE id = NEW.registration_id;
    ELSIF NEW.status = 'partially_refunded' THEN
        UPDATE registrations 
        SET payment_status = 'partially_refunded'
        -- Do not cancel registration for partial refunds
        WHERE id = NEW.registration_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for syncing payment status
CREATE TRIGGER sync_reg_payment_status
    AFTER INSERT OR UPDATE OF status ON payments
    FOR EACH ROW
    EXECUTE FUNCTION sync_registration_payment_status();

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own payments"
    ON payments FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create payments"
    ON payments FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.id = registration_id
            AND r.participant_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all payments"
    ON payments FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can update payments"
    ON payments FOR UPDATE
    USING (is_admin());
