import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './button';
import { Label } from './label';
import { AlertWithIcon } from './alert';
import { AlertTriangle, Eraser } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  width?: number;
  height?: number;
  disabled?: boolean;
  className?: string;
}

export function SignaturePad({
  onSave,
  width = 500,
  height = 200,
  disabled = false,
  className
}: SignaturePadProps) {
  const signaturePad = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    if (signaturePad.current) {
      signaturePad.current.clear();
      setIsEmpty(true);
    }
  };

  const handleEnd = () => {
    if (signaturePad.current) {
      setIsEmpty(signaturePad.current.isEmpty());
      if (!signaturePad.current.isEmpty()) {
        const dataUrl = signaturePad.current.getTrimmedCanvas().toDataURL('image/png');
        onSave(dataUrl);
      }
    }
  };

  const handleBegin = () => {
    if (disabled) return;
  };

  return (
    <div className="space-y-4">
      <AlertWithIcon
        variant="warning"
        icon={AlertTriangle}
        title="Important"
        description="Cette signature électronique a valeur légale et sera utilisée pour votre contrat d'assurance."
      />

      <div className="space-y-2">
        <Label htmlFor="signature-pad">Votre signature</Label>
        <div 
          className="border rounded-lg p-4 bg-white"
          role="application"
          aria-label="Zone de signature"
        >
          <SignatureCanvas
            ref={signaturePad}
            canvasProps={{
              id: "signature-pad",
              width,
              height,
              className: 'signature-canvas border rounded w-full h-auto',
              style: { 
                width: '100%', 
                height: '100%',
                cursor: disabled ? 'not-allowed' : 'crosshair'
              },
              role: "img",
              "aria-label": "Zone de signature électronique"
            }}
            onEnd={handleEnd}
            onBegin={handleBegin}
            dotSize={2}
            minWidth={2}
            maxWidth={4}
            throttle={16}
            backgroundColor="rgb(255, 255, 255)"
            penColor="rgb(0, 0, 0)"
            velocityFilterWeight={0.7}
            disabled={disabled}
          />
        </div>
        {isEmpty && (
          <p className="text-sm text-gray-500" id="signature-hint">
            Signez dans la zone ci-dessus en utilisant votre souris ou votre doigt
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={clear}
          disabled={disabled || isEmpty}
          aria-label="Effacer la signature"
        >
          <Eraser className="h-4 w-4 mr-2" />
          Effacer
        </Button>
        <Button
          onClick={() => {
            if (signaturePad.current && !signaturePad.current.isEmpty()) {
              const dataUrl = signaturePad.current.getTrimmedCanvas().toDataURL('image/png');
              onSave(dataUrl);
            }
          }}
          disabled={disabled || isEmpty}
          aria-label="Valider la signature"
        >
          Valider la signature
        </Button>
      </div>
    </div>
  );
}