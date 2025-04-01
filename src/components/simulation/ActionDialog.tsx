import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmailQuoteForm } from './EmailQuoteForm';
import { CallbackRequestForm } from './CallbackRequestForm';

interface ActionDialogProps {
  type: 'email' | 'callback';
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function ActionDialog({
  type,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: ActionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'email' 
              ? 'Recevoir le devis par email'
              : 'Être rappelé par un conseiller'
            }
          </DialogTitle>
        </DialogHeader>

        {type === 'email' ? (
          <EmailQuoteForm onSubmit={onSubmit} isLoading={isLoading} />
        ) : (
          <CallbackRequestForm onSubmit={onSubmit} isLoading={isLoading} />
        )}
      </DialogContent>
    </Dialog>
  );
}