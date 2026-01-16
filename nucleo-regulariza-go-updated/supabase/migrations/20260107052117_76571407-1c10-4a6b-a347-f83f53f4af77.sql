-- Create notifications table for real-time alerts
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id TEXT NOT NULL,
    case_name TEXT NOT NULL,
    recipient_type TEXT NOT NULL DEFAULT 'topographer', -- 'topographer' or 'client'
    recipient_id TEXT, -- user id if authenticated
    type TEXT NOT NULL, -- 'croqui_updated', 'document_uploaded', 'form_updated', 'case_submitted', 'pendency_resolved'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- For now, allow all reads (will restrict by user when auth is implemented)
CREATE POLICY "Anyone can read notifications" 
ON public.notifications 
FOR SELECT 
USING (true);

-- Allow inserts from anyone (for portal submissions)
CREATE POLICY "Anyone can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Allow users to update only their own notifications (e.g., mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (recipient_id IS NOT NULL AND recipient_id = auth.uid()::text)
WITH CHECK (recipient_id IS NOT NULL AND recipient_id = auth.uid()::text);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create index for faster queries
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_type, read);
CREATE INDEX idx_notifications_case ON public.notifications(case_id);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);