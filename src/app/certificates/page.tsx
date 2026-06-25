'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Download, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCopy } from '@/context/LanguageContext';
import WorldPageHeader from '@/components/world/WorldPageHeader';
import Ac7BrandWatermark from '@/components/ac7/Ac7BrandWatermark';

interface Cert {
  id: string;
  title: string;
  issued_at: string;
  season_id: string;
}

function CertificateModal({ cert, name, onClose }: { cert: Cert; name: string; onClose: () => void }) {
  const COPY = useCopy();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 print:bg-white print:p-0">
      <div className="w-full max-w-xl">
        <div className="mb-3 flex justify-end gap-2 print:hidden">
          <button type="button" onClick={() => window.print()} className="ac7-btn">
            <Download size={16} /> Download PDF
          </button>
          <button type="button" onClick={onClose} className="ac7-btn ac7-btn-outline">
            <X size={16} /> Close
          </button>
        </div>
        <div
          id="cert-print"
          className="rounded-3xl border-4 border-orange-500 bg-gradient-to-br from-[#111111] to-[#000000] p-10 text-center text-white print:rounded-none print:border-orange-500"
        >
          <Award size={48} className="mx-auto text-navy" />
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-navy">AC7 Elite</p>
          <h1 className="mt-2 text-3xl font-extrabold">{COPY.certificates.modalHeading}</h1>
          <p className="mt-6 text-sm text-slate-300">{COPY.certificates.modalCertifies}</p>
          <p className="mt-1 text-2xl font-bold">{name}</p>
          <p className="mt-4 text-sm text-slate-300">{COPY.certificates.modalCompleted}</p>
          <p className="mt-1 text-lg font-semibold text-navy">{cert.title}</p>
          <p className="mt-6 text-xs text-slate-400">
            {COPY.certificates.modalIssued} {new Date(cert.issued_at).toLocaleDateString()}
          </p>
          <p className="mt-1 text-xs text-slate-400">{COPY.certificates.modalFooter}</p>
        </div>
      </div>
    </div>
  );
}

function CertificatesContent() {
  const COPY = useCopy();
  const { appUser, supabaseUser } = useAuth();
  const [certs, setCerts] = useState<Cert[]>([]);
  const [open, setOpen] = useState<Cert | null>(null);

  useEffect(() => {
    if (!supabaseUser) return;
    (async () => {
      const { data } = await supabase
        .from('certificates')
        .select('id,title,issued_at,season_id')
        .eq('user_id', supabaseUser.id)
        .order('issued_at', { ascending: false });
      if (data) setCerts(data as any);
    })();
  }, [supabaseUser]);

  return (
    <div className="fit-page">
      <div className="fit-sub-bar">
        <Link href="/home">← Home</Link>
      </div>

      <WorldPageHeader title={COPY.certificates.title} subline={COPY.certificates.subtitle} />

      {certs.length === 0 ? (
        <div className="text-center py-8">
          <Ac7BrandWatermark />
          <p className="mt-3 font-semibold">{COPY.certificates.empty}</p>
          <p className="text-sm text-muted mt-1">{COPY.certificates.emptyHint}</p>
          <Link href="/missions" className="fit-btn fit-btn--primary mt-4 inline-flex">
            {COPY.certificates.cta}
          </Link>
        </div>
      ) : (
        <section>
          {certs.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setOpen(c)}
              className="fit-cert-row w-full text-left"
            >
              <Award size={20} className="text-orange-400 shrink-0" />
              <span className="flex-1 font-semibold">{c.title}</span>
              <span className="text-sm text-muted">{new Date(c.issued_at).toLocaleDateString()}</span>
            </button>
          ))}
        </section>
      )}

      {open && (
        <CertificateModal cert={open} name={appUser?.name ?? COPY.defaultName} onClose={() => setOpen(null)} />
      )}
    </div>
  );
}

export default function CertificatesPage() {
  return (
    <ProtectedRoute>
      <CertificatesContent />
    </ProtectedRoute>
  );
}
