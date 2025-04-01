import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { AlertWithIcon } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { validateFile } from '@/lib/files';
import { toast } from '@/lib/hooks/useToast';
import { event } from '@/lib/analytics';
import { AlertTriangle, ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import type { InsuranceDocument } from '@/types/database';

export type DocumentType = 'IDENTITY' | 'PROOF_OF_ADDRESS' | 'BANK_DETAILS' | 'LOAN_OFFER';

interface DocumentDefinition {
  type: DocumentType;
  label: string;
  accept: string;
  helperText: string;
  required: boolean;
  maxSize: number;
}

interface DocumentUploadProps {
  applicationId: string;
  onComplete: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const REQUIRED_DOCUMENTS: DocumentDefinition[] = [
  {
    type: 'IDENTITY',
    label: "Pièce d'identité",
    accept: 'application/pdf,image/*',
    helperText: "Carte d'identité, passeport ou titre de séjour en cours de validité",
    required: true,
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  {
    type: 'PROOF_OF_ADDRESS',
    label: 'Justificatif de domicile',
    accept: 'application/pdf,image/*',
    helperText: 'Moins de 3 mois (facture énergie, téléphone, etc.)',
    required: true,
    maxSize: 5 * 1024 * 1024
  },
  {
    type: 'BANK_DETAILS',
    label: 'RIB',
    accept: 'application/pdf,image/*',
    helperText: "Relevé d'identité bancaire",
    required: true,
    maxSize: 2 * 1024 * 1024
  },
  {
    type: 'LOAN_OFFER',
    label: 'Offre de prêt',
    accept: 'application/pdf',
    helperText: 'Offre de prêt émise par votre banque',
    required: true,
    maxSize: 10 * 1024 * 1024
  }
];

export function DocumentUpload({
  applicationId,
  onComplete,
  onBack,
  isLoading = false
}: DocumentUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<Record<DocumentType, boolean>>(
    REQUIRED_DOCUMENTS.reduce((acc, doc) => ({ ...acc, [doc.type]: false }), {} as Record<DocumentType, boolean>)
  );
  const [uploadProgress, setUploadProgress] = useState<Record<DocumentType, number>>(
    REQUIRED_DOCUMENTS.reduce((acc, doc) => ({ ...acc, [doc.type]: 0 }), {} as Record<DocumentType, number>)
  );

  const handleFileUpload = async (type: DocumentType, file: File) => {
    try {
      const docDef = REQUIRED_DOCUMENTS.find(d => d.type === type);
      if (!docDef) throw new Error('Type de document invalide');

      // Validate file
      if (!validateFile(file, docDef.maxSize, docDef.accept.split(','))) {
        return;
      }

      // Start upload
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));

      // Upload to Supabase Storage
      const filePath = `documents/${applicationId}/${type.toLowerCase()}_${Date.now()}${getFileExtension(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [type]: (progress.loaded / progress.total) * 100
            }));
          }
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Save document reference
      const { data: document, error: dbError } = await supabase
        .from('insurance_documents')
        .insert({
          application_id: applicationId,
          type,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Track upload
      event({
        action: 'document_uploaded',
        category: 'document',
        label: type
      });

      setUploadStatus(prev => ({ ...prev, [type]: true }));
      
      toast({
        variant: "success",
        title: "Document envoyé",
        description: "Le document a été téléchargé avec succès"
      });

      return document;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible d'envoyer le document"
      });
    }
  };

  const handleSubmit = () => {
    const allRequired = REQUIRED_DOCUMENTS
      .filter(doc => doc.required)
      .every(doc => uploadStatus[doc.type]);

    if (!allRequired) {
      toast({
        variant: "error",
        title: "Documents manquants",
        description: "Veuillez télécharger tous les documents requis"
      });
      return;
    }

    onComplete();
  };

  return (
    <div className="space-y-8">
      <AlertWithIcon
        variant="info"
        icon={FileText}
        title="Documents requis"
        description="Merci de fournir les documents suivants pour compléter votre dossier."
      />

      <div className="space-y-6">
        {REQUIRED_DOCUMENTS.map((doc) => (
          <div key={doc.type} className="space-y-2">
            <FileUpload
              label={doc.label}
              helperText={doc.helperText}
              accept={doc.accept}
              required={doc.required}
              maxSize={doc.maxSize}
              onFileSelect={(file) => handleFileUpload(doc.type, file)}
              isComplete={uploadStatus[doc.type]}
              progress={uploadProgress[doc.type]}
              disabled={isLoading}
            />
          </div>
        ))}
      </div>

      <AlertWithIcon
        variant="warning"
        icon={AlertTriangle}
        title="Important"
        description="Vos documents sont traités de manière sécurisée et confidentielle."
      />

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !Object.values(uploadStatus).some(Boolean)}
        >
          Continuer
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop();
  return ext ? `.${ext}` : '';
}