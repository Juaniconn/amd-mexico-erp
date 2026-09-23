'use client';

import { useState, FormEvent, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface UploadPlanoModalProps {
  isOpen: boolean;
  onClose: () => void;
  proyectoId: string;
  onUploadSuccess: () => void;
}

export function UploadPlanoModal({
  isOpen,
  onClose,
  proyectoId,
  onUploadSuccess,
}: UploadPlanoModalProps) {
  const [parteNumero, setParteNumero] = useState('');
  const [version, setVersion] = useState('1');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Seleccione un archivo');
      return;
    }
    if (!parteNumero.trim()) {
      setError('Ingrese el número de parte');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('parteNumero', parteNumero);
      formData.append('version', version);

      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/ingenieria/${proyectoId}/planos`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al subir plano');
      }

      onUploadSuccess();
      onClose();
      setFile(null);
      setParteNumero('');
      setVersion('1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir plano');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Subir Plano
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="parteNumero">Número de Parte</Label>
            <Input
              id="parteNumero"
              value={parteNumero}
              onChange={(e) => setParteNumero(e.target.value)}
              placeholder="Ej: PARTE-001"
              required
            />
          </div>

          <div>
            <Label htmlFor="version">Versión</Label>
            <Input
              id="version"
              type="number"
              min="1"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
          </div>

          <div>
            <Label>Archivo (ZIP, PDF, DWG, STEP)</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                {file ? file.name : 'Seleccionar archivo'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,.pdf,.dwg,.step,.stp,.iges,.igs,.sldprt,.prt"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading || !file}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                'Subir'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
