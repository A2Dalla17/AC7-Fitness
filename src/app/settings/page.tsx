'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Globe, Lock, Moon, Shield, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCopy, useLanguage } from '@/context/LanguageContext';
import type { LangCode } from '@/lib/i18n';
import { ALL_LANGUAGES } from '@/lib/i18n/languages';
import ProtectedRoute from '@/components/ProtectedRoute';
import WorldPageHeader from '@/components/world/WorldPageHeader';
import PremiumCard from '@/components/premium/PremiumCard';
import { LEGACY } from '@/lib/legacyBrand';

function SettingsContent() {
  const copy = useCopy();
  const { lang, setLang } = useLanguage();
  const { appUser, signOut } = useAuth();
  const { mode, setMode } = useTheme();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const initial = appUser?.name?.charAt(0).toUpperCase() ?? 'A';

  return (
    <div className="fit-page">
      <WorldPageHeader title={copy.settings.title} subline={LEGACY.philosophy} />

      <PremiumCard>
        <div className="settings-avatar-row">
          <div className="settings-avatar">{initial}</div>
          <div>
            <p className="font-semibold text-ink">{appUser?.name}</p>
            <p className="text-sm text-muted">{appUser?.email}</p>
          </div>
        </div>
      </PremiumCard>

      <div className="settings-section">
        <p className="settings-section__title">{copy.settings.account}</p>
        <PremiumCard>
          <Link href="/profile" className="settings-row">
            <span>{copy.profile.title}</span>
            <ChevronRight size={16} className="text-muted" />
          </Link>
          {appUser?.role === 'coach' && (
            <Link href="/coach-dashboard" className="settings-row">
              <span>Coach Dashboard</span>
              <ChevronRight size={16} className="text-muted" />
            </Link>
          )}
        </PremiumCard>
      </div>

      <div className="settings-section">
        <p className="settings-section__title">{copy.settings.preferences}</p>
        <PremiumCard>
          <div className="settings-row">
            <span className="flex items-center gap-2">
              <Globe size={16} className="text-muted" /> {copy.settings.language}
            </span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LangCode)}
              className="rounded-lg border border-[var(--elite-card-border)] bg-transparent px-2 py-1 text-sm max-w-[9rem]"
            >
              {ALL_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="settings-row">
            <span className="flex items-center gap-2">
              <Moon size={16} className="text-muted" /> {copy.settings.theme}
            </span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'dark' | 'light')}
              className="rounded-lg border border-[var(--elite-card-border)] bg-transparent px-2 py-1 text-sm"
            >
              <option value="dark">{copy.settings.dark}</option>
              <option value="light">{copy.settings.light}</option>
            </select>
          </div>
        </PremiumCard>
      </div>

      <div className="settings-section">
        <p className="settings-section__title">{copy.settings.security}</p>
        <PremiumCard>
          <button type="button" className="settings-row w-full text-left">
            <span className="flex items-center gap-2">
              <Lock size={16} className="text-muted" /> Change Password
            </span>
            <ChevronRight size={16} className="text-muted" />
          </button>
          <div className="settings-row">
            <span className="flex items-center gap-2">
              <Shield size={16} className="text-muted" /> Two-Factor Authentication
            </span>
            <button
              type="button"
              onClick={() => setTwoFactor((v) => !v)}
              className={`h-6 w-11 rounded-full transition-colors ${twoFactor ? 'bg-orange-500' : 'bg-white/10'}`}
            >
              <span
                className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
                  twoFactor ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </PremiumCard>
      </div>

      <div className="settings-section">
        <p className="settings-section__title">{copy.settings.notifications}</p>
        <PremiumCard>
          <div className="settings-row">
            <span className="flex items-center gap-2">
              <Bell size={16} className="text-muted" /> Push Notifications
            </span>
            <button
              type="button"
              onClick={() => setNotifications((v) => !v)}
              className={`h-6 w-11 rounded-full transition-colors ${notifications ? 'bg-orange-500' : 'bg-white/10'}`}
            >
              <span
                className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </PremiumCard>
      </div>

      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.push('/login');
        }}
        className="fit-btn fit-btn--ghost fit-btn--danger fit-btn--block"
      >
        {copy.profile.signOut}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
