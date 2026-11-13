'use client';

import { AccountSection } from '@/components/settings/account-section';
import { AppearanceSection } from '@/components/settings/appearance-section';
import { MemorySection } from '@/components/settings/memory-section';
import { PreferencesSection } from '@/components/settings/preferences-section';
import { PrivacySection } from '@/components/settings/privacy-section';
import { ProfileSection } from '@/components/settings/profile-section';
import { SettingsSection } from '@/components/settings/settings-section';
import { PageContainer } from '@/components/shared/page-container';
import { PageHeading } from '@/components/shared/page-heading';

export function SettingsView() {
  return (
    <PageContainer className="flex flex-col gap-6">
      <PageHeading
        title="Settings"
        description="Manage your profile, appearance, and prototype preferences."
      />

      <div className="divide-y divide-border">
        <SettingsSection
          title="Profile"
          description="Your display name and email address."
        >
          <ProfileSection />
        </SettingsSection>

        <SettingsSection
          title="Appearance"
          description="Choose how DocuMind AI looks on this device."
        >
          <AppearanceSection />
        </SettingsSection>

        <SettingsSection
          title="Preferences"
          description="Defaults for answers and source display."
        >
          <PreferencesSection />
        </SettingsSection>

        <SettingsSection
          title="Memory"
          description="What DocuMind remembers between conversations."
        >
          <MemorySection />
        </SettingsSection>

        <SettingsSection
          title="Privacy"
          description="Export or remove your data."
        >
          <PrivacySection />
        </SettingsSection>

        <SettingsSection
          title="Account"
          description="Sign out of this prototype session."
        >
          <AccountSection />
        </SettingsSection>
      </div>
    </PageContainer>
  );
}
