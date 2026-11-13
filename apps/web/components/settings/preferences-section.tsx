'use client';

import { useState } from 'react';
import { StatusMessage } from '@/components/shared/status-message';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export function PreferencesSection() {
  const [answerStyle, setAnswerStyle] = useState('balanced');
  const [citeSources, setCiteSources] = useState(true);
  const [showPreviews, setShowPreviews] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    // TODO: REMOVE MOCK — Replace simulated preference save with backend integration.
    setSaved(true);
  }

  return (
    <div className="flex max-w-lg flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="answer-style">Default answer style</Label>
        <Select
          id="answer-style"
          value={answerStyle}
          onChange={(event) => {
            setAnswerStyle(event.target.value);
            setSaved(false);
          }}
        >
          <option value="balanced">Balanced</option>
          <option value="concise">Concise</option>
          <option value="detailed">Detailed</option>
        </Select>
        <p className="text-xs text-foreground-muted">
          Controls how future answers are summarized in the prototype.
        </p>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <Label htmlFor="cite-sources">Always include citations</Label>
          <p className="mt-0.5 text-xs text-foreground-muted">
            Show source references alongside assistant answers.
          </p>
        </div>
        <Switch
          id="cite-sources"
          checked={citeSources}
          onCheckedChange={(checked) => {
            setCiteSources(checked);
            setSaved(false);
          }}
        />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <Label htmlFor="show-previews">Show source previews in chat</Label>
          <p className="mt-0.5 text-xs text-foreground-muted">
            Open source details beside the conversation on desktop.
          </p>
        </div>
        <Switch
          id="show-previews"
          checked={showPreviews}
          onCheckedChange={(checked) => {
            setShowPreviews(checked);
            setSaved(false);
          }}
        />
      </div>

      {saved ? (
        <StatusMessage tone="success">
          Preferences were saved to this prototype session only.
        </StatusMessage>
      ) : null}

      <Button type="button" onClick={handleSave} className="self-start">
        Save preferences
      </Button>
    </div>
  );
}
