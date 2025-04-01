import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from './useToast';
import type { InsuranceDocument } from '@/types/database';

export function useDocumentManagement(applicationId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<InsuranceDocument[]>([]);

  const uploadDocument = async (file: File, type: string) => {
    try {
      setIsLoading(true);

      // Upload to Supabase Storage
      const filePath = `documents/${applicationId}/${type.toLowerCase()}_${Date.now()}${getFileExtension(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

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

      setDocuments(prev => [...prev, document]);
      
      toast({
        variant: "success",
        title: "Document envoyé",
        description: "Le document a été téléchargé avec succès"
      });

      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible d'envoyer le document"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      setIsLoading(true);

      // Get document info
      const { data: document, error: fetchError } = await supabase
        .from('insurance_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('insurance_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        variant: "success",
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès"
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de supprimer le document"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('insurance_documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(data);
      return data;
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de charger les documents"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    documents,
    isLoading,
    uploadDocument,
    deleteDocument,
    loadDocuments
  };
}

function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop();
  return ext ? `.${ext}` : '';
}