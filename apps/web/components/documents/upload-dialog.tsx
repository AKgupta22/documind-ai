'use client';

import { FileUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { StatusMessage } from '@/components/shared/status-message';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import type { DocumentRecord, DocumentType } from '@/lib/types';
import { formatBytes } from '@/lib/format';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (document: DocumentRecord) => void;
}

interface PendingFile {
  name: string;
  sizeBytes: number;
  type: DocumentType;
}

function inferType(name: string): DocumentType {
  return name.toLowerCase().endsWith('.txt') ? 'txt' : 'pdf';
}

export function UploadDialog({ open, onOpenChange, onUploaded }: UploadDialogProps) {
  const [file, setFile] = useState<PendingFile | null>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'complete'>('idle');

  function reset() {
    setFile(null);
    setProgress(0);
    setPhase('idle');
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && phase === 'uploading') {
      return;
    }
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  }

  function handleSelectedFile(selected: File | undefined) {
    if (!selected) {
      return;
    }
    setFile({
      name: selected.name,
      sizeBytes: selected.size,
      type: inferType(selected.name),
    });
    setProgress(0);
    setPhase('idle');
  }

  function useSampleFile() {
    // TODO: REMOVE MOCK — Replace simulated sample upload with backend integration.
    setFile({
      name: 'Sample Research Notes.pdf',
      sizeBytes: 240_000,
      type: 'pdf',
    });
    setProgress(0);
    setPhase('idle');
  }

  function startUpload() {
    if (!file) {
      return;
    }

    setPhase('uploading');
    setProgress(8);

    // TODO: REMOVE MOCK — Replace simulated upload progress with backend integration.
    let current = 8;
    const interval = window.setInterval(() => {
      current = Math.min(100, current + 14);
      setProgress(current);

      if (current >= 100) {
        window.clearInterval(interval);
        const uploaded: DocumentRecord = {
          id: `doc-local-${Date.now()}`,
          name: file.name,
          type: file.type,
          sizeBytes: file.sizeBytes,
          status: 'indexed',
          uploadedAt: new Date().toISOString(),
          summary:
            'Simulated upload. No file left the browser and no indexing pipeline ran.',
        };
        setPhase('complete');
        onUploaded(uploaded);
      }
    }, 220);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload documents</DialogTitle>
          <DialogDescription>
            PDF and TXT files are accepted. This prototype simulates upload and indexing
            locally; no file is sent to a server.
          </DialogDescription>
        </DialogHeader>

        <label
          htmlFor="document-file"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleSelectedFile(event.dataTransfer.files[0]);
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-surface-secondary px-4 py-8 text-center transition-colors hover:border-primary focus-within:ring-2 focus-within:ring-ring"
        >
          <FileUp className="size-5 text-foreground-muted" aria-hidden="true" />
          <span className="text-sm font-medium">Choose a file or drop it here</span>
          <span className="text-xs text-foreground-muted">PDF or TXT, up to 25 MB</span>
          <input
            id="document-file"
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className="sr-only"
            onChange={(event) => handleSelectedFile(event.target.files?.[0])}
            disabled={phase === 'uploading'}
          />
        </label>

        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={useSampleFile}>
            Use a sample file
          </Button>
          {file ? (
            <p className="truncate text-xs text-foreground-secondary">
              {file.name} · {formatBytes(file.sizeBytes)}
            </p>
          ) : null}
        </div>

        {phase !== 'idle' && file ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-foreground-secondary">
              <span>{phase === 'complete' ? 'Simulated indexing complete' : 'Simulating upload…'}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} aria-label="Simulated upload progress" />
          </div>
        ) : null}

        {phase === 'complete' ? (
          <StatusMessage tone="success">
            The document was added to this prototype session only. No upload or indexing
            occurred.
          </StatusMessage>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
            {phase === 'complete' ? 'Close' : 'Cancel'}
          </Button>
          {phase !== 'complete' ? (
            <Button type="button" onClick={startUpload} disabled={!file || phase === 'uploading'}>
              {phase === 'uploading' ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {phase === 'uploading' ? 'Uploading…' : 'Upload and index'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
