'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { getApiUrl } from '@/lib/orientation-api';

type Lang = 'tn' | 'fr' | 'en';

const TEXT: Record<Lang, {
  title: string; subtitle: string; emailPlaceholder: string; send: string;
  noThanks: string; sending: string; success: string; error: string;
}> = {
  fr: {
    title: 'Recevoir votre PDF ?',
    subtitle: 'Nous pouvons vous envoyer par email un rapport PDF avec vos 10 choix d\'orientation.',
    emailPlaceholder: 'votre@email.com',
    send: 'Envoyer le PDF',
    noThanks: 'Non merci',
    sending: 'Envoi en cours…',
    success: 'PDF envoyé ! Vérifiez votre boîte mail.',
    error: 'Échec de l\'envoi. Réessayez.',
  },
  tn: {
    title: 'تحب تستقبل PDF؟',
    subtitle: 'ننجمو نبعثولك تقرير PDF فيه الـ 10 اختيارات متاعك بالإيميل.',
    emailPlaceholder: 'إيميلك@email.com',
    send: 'ابعث PDF',
    noThanks: 'لا شكراً',
    sending: 'قاعدين نبعثو…',
    success: 'تبعث! شوف الإيميل متاعك.',
    error: 'ما تبعثش. عاود جرّب.',
  },
  en: {
    title: 'Receive your PDF?',
    subtitle: 'We can email you a PDF report with your 10 orientation choices.',
    emailPlaceholder: 'your@email.com',
    send: 'Send PDF',
    noThanks: 'No thanks',
    sending: 'Sending…',
    success: 'PDF sent! Check your inbox.',
    error: 'Send failed. Try again.',
  },
};

interface Props {
  open: boolean;
  sessionId: string;
  lang: Lang;
  onClose: () => void;
}

export default function ResultsPdfModal({ open, sessionId, lang, onClose }: Props) {
  const t = TEXT[lang];
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleDecline = async () => {
    if (sessionId) {
      await fetch(getApiUrl('/api/orientation/decline-pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).catch(() => null);
    }
    onClose();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !sessionId) return;

    setLoading(true);
    setError('');

    try {
      const resp = await fetch(getApiUrl('/api/orientation/send-pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, email: email.trim() }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || t.error);
      setDone(true);
      setTimeout(onClose, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 md:p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button
              onClick={handleDecline}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label={t.noThanks}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{t.title}</h2>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-6 leading-relaxed">{t.subtitle}</p>

            {done ? (
              <div className="flex items-center gap-3 text-emerald-400 py-4">
                <CheckCircle2 className="w-6 h-6" />
                <span>{t.success}</span>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                  {loading ? t.sending : t.send}
                </button>

                <button
                  type="button"
                  onClick={handleDecline}
                  className="w-full py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {t.noThanks}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
