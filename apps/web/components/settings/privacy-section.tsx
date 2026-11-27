'use client';

import { Download, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { StatusMessage } from '@/components/shared/status-message';
import { Button } from '@/components/ui/button';

export function PrivacySection() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  function handleExport() {
    // TODO: REMOVE MOCK — Replace simulated data export with backend integration.
    setExportNotice(
      'A data export would be prepared and emailed in a connected app. Nothing was exported in this prototype.',
    );
  }

  async function handleDeleteAccount() {
    setPending(true);
    // TODO: REMOVE MOCK — Replace simulated account deletion with backend integration.
    await signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <div className="flex max-w-lg flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Export your data</p>
        <p className="text-xs text-foreground-secondary">
          Request a copy of your documents, conversations, and settings.
        </p>
        <Button type="button" variant="secondary" onClick={handleExport} className="self-start">
          <Download className="size-4" aria-hidden="true" />
          Request data export
        </Button>
        {exportNotice ? <StatusMessage tone="info">{exportNotice}</StatusMessage> : null}
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <p className="text-sm font-medium text-danger">Delete account</p>
        <p className="text-xs text-foreground-secondary">
          This prototype has no account deletion endpoint. Confirming signs you out of your
          current session.
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={() => setConfirmOpen(true)}
          className="self-start"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete account
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete account?"
        description="No account or data will be deleted because this is a prototype. You will be signed out of your current session."
        confirmLabel="Sign out"
        onConfirm={() => {
          void handleDeleteAccount();
        }}
        isPending={pending}
      />
    </div>
  );
}
