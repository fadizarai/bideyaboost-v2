"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import {
    Star, CheckCircle2, GraduationCap, MapPin, TrendingUp, MessageCircle,
    Shield, AlertTriangle, BookOpen, Users, Globe, Award, BarChart3, ExternalLink, Target, X,
} from 'lucide-react';
import { AiChat } from '@/components/AiChat';
import ResultsPdfModal from '@/components/results/ResultsPdfModal';
import ResultsComparisonTable from '@/components/results/ResultsComparisonTable';
import RecommendationDetailModal from '@/components/results/RecommendationDetailModal';
import { enrichRecommendationsWithGuide, getApiUrl } from '@/lib/orientation-api';
import {
    buildMatchInsight, getFgComparison, getFgLabels, getGeographicBonusLabel, getScoreDimensions,
    getStudentFg, getStudentFgBase, getStudentFgWithBonus, isTechnicalExplanation, type ScoreBreakdown,
} from '@/lib/recommendation-insights';
import { getRecommendationDisplay, normalizeRecommendation } from '@/lib/recommendation-display';
import { getRegionGroupLabels, groupRecommendationsByRegion } from '@/lib/orientation-regions';

type Recommendation = {
    id: string;
    programId: string;
    institution: string;
    university: string;
    specialty?: string;
    field?: string;
    domain?: string;
    city?: string;
    institution_type?: string;
    degree?: string;
    study_duration_years?: number;
    admission_score_last?: number | null;
    admission_score_min?: number | null;
    capacity?: number | null;
    language_of_study?: string;
    orientation_code?: string;
    website?: string;
    academic_year?: string;
    student_orientation_score?: number | null;
    geographic_bonus_applied?: boolean | null;
    geographic_bonus_points?: number | null;
    geographic_bonus_reason?: string | null;
    specialty_in_home_region?: boolean | null;
    score: number;
    admission_probability?: number;
    admissionProbability?: number;
    risk_tier?: 'Safe' | 'Likely' | 'Reach';
    confidence?: string;
    explanation?: string;
    llmExplanation?: string;
    score_breakdown?: ScoreBreakdown | null;
};

type StudentProfile = {
    bacType?: string;
    bacAverage?: number;
    region?: string;
    homeRegion?: string;
    preferredRegions?: string[];
    fgSubjectMean?: number;
    orientationScoreFg?: number;
};

type AiTrace = {
    orientation_score_fg?: number;
    bac_section?: string;
    subject_mean?: number;
    specialty_in_home_region?: boolean;
    geographic_bonus_rate?: string;
};

const RISK_STYLES = {
    Safe: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: Shield },
    Likely: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', icon: TrendingUp },
    Reach: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: AlertTriangle },
};

const COMPARISON_COLORS = {
    above: 'from-emerald-500 to-emerald-400',
    within: 'from-cyan-500 to-cyan-400',
    below: 'from-amber-500 to-orange-400',
    unknown: 'from-slate-500 to-slate-400',
};

function ScoreBar({ value, color = 'bg-indigo-500' }: { value: number; color?: string }) {
    const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
    return (
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
    );
}

function StatCell({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
    return (
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Icon className="w-3 h-3" />{label}
            </div>
            <p className="text-sm font-semibold text-white">{value}</p>
        </div>
    );
}

export type ResultsPageProps = {
  fallbackPath?: string;
};

export function ResultsPageContent({ fallbackPath = '/calcule-score' }: ResultsPageProps = {}) {
    const { t, lang } = useLanguage();
    const router = useRouter();
    const l = lang as 'tn' | 'fr' | 'en';

    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [advisorSummary, setAdvisorSummary] = useState('');
    const [studentId, setStudentId] = useState('');
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [trace, setTrace] = useState<AiTrace | null>(null);
    const [feedbackSent, setFeedbackSent] = useState<Record<string, boolean>>({});
    const [showChat, setShowChat] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [globalSatisfaction, setGlobalSatisfaction] = useState(0);
    const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'careers' | 'requirements'>('overview');

    const handleSelectRecommendation = (rec: Record<string, unknown>) => {
        setSelectedRec(rec as Recommendation);
        setActiveTab('overview');
    };

    const handleCloseModal = () => {
        setSelectedRec(null);
    };

    const labels = {
        match:           l === 'tn' ? 'توافق'                  : l === 'fr' ? 'Compatibilité'             : 'Match',
        admission:       l === 'tn' ? 'فرصة القبول'             : l === 'fr' ? "Probabilité d'admission"   : 'Admission probability',
        official:        l === 'tn' ? 'معلومات الڤايد الرسمي'  : l === 'fr' ? 'Données du guide officiel'  : 'Official guide data',
        yourProfile:     l === 'tn' ? 'بروفيلك الأكاديمي'       : l === 'fr' ? 'Votre profil académique'   : 'Your academic profile',
        fgScore:         l === 'tn' ? 'score FG (توجيه)'        : l === 'fr' ? 'Score FG (orientation)'    : 'FG orientation score',
        bacAvg:          l === 'tn' ? 'معدل الباك'              : l === 'fr' ? 'Moyenne du bac'            : 'Bac average',
        analysis:        l === 'tn' ? 'تحليل التوافق'           : l === 'fr' ? 'Analyse de compatibilité'  : 'Compatibility analysis',
        criteria:        l === 'tn' ? 'معايير التقييم'          : l === 'fr' ? "Critères d'évaluation"    : 'Scoring criteria',
        years:           l === 'tn' ? 'سنين'                    : l === 'fr' ? 'ans'                       : 'years',
        places:          l === 'tn' ? 'بلاصات'                  : l === 'fr' ? 'places'                    : 'seats',
        visit:           l === 'tn' ? 'الموقع الرسمي'           : l === 'fr' ? 'Site officiel'             : 'Official website',
        section:         l === 'tn' ? 'شعبة'                    : l === 'fr' ? 'Section'                   : 'Section',
        diploma:         l === 'tn' ? 'الشهادة'                 : l === 'fr' ? 'Diplôme'                   : 'Degree',
        type:            l === 'tn' ? 'نوع المؤسسة'             : l === 'fr' ? 'Type'                      : 'Type',
        language:        l === 'tn' ? 'لغة التدريس'             : l === 'fr' ? 'Langue'                    : 'Language',
        capacity:        l === 'tn' ? 'عدد البلاصات'            : l === 'fr' ? 'Capacité'                  : 'Capacity',
        duration:        l === 'tn' ? 'المدة'                   : l === 'fr' ? 'Durée'                     : 'Duration',
        code:            l === 'tn' ? 'كود التوجيه'             : l === 'fr' ? 'Code orientation'          : 'Orientation code',
        year:            l === 'tn' ? 'السنة الجامعية'          : l === 'fr' ? 'Année universitaire'       : 'Academic year',
        geoBonus:        l === 'tn' ? 'بونوس جغرافي'            : l === 'fr' ? 'Bonification géographique' : 'Geographic bonus',
        fgBase:          l === 'tn' ? 'FG قبل البونوس'          : l === 'fr' ? 'FG avant bonification'     : 'FG before bonus',
        specialtyAbsent: l === 'tn'
            ? 'الاختصاص الي تحبّو ما فماش في ولايتك — نلوّج في الولايات المجاورة'
            : l === 'fr'
            ? 'Spécialité souhaitée absente dans votre région — orientation vers les régions voisines'
            : 'Desired specialty not available in your region — searching neighboring regions',
    };

    useEffect(() => {
        const stored = sessionStorage.getItem('bideya_recommendations');
        const summary = sessionStorage.getItem('bideya_advisorSummary');
        const sid = sessionStorage.getItem('bideya_studentId');
        const profileRaw = sessionStorage.getItem('bideya_studentProfile');
        const traceRaw = sessionStorage.getItem('bideya_ai_trace');
        const sessId = sessionStorage.getItem('bideya_sessionId');

        if (!stored) {
            router.push(fallbackPath);
            return;
        }

        let cancelled = false;
        const parsed: Recommendation[] = JSON.parse(stored);

        (async () => {
            const profileData = profileRaw ? JSON.parse(profileRaw) as StudentProfile : null;
            const enriched = await enrichRecommendationsWithGuide(parsed, {
                bacType: profileData?.bacType,
            });
            if (cancelled) return;
            const normalized = enriched.map((rec) => normalizeRecommendation(rec as Recommendation));
            const top10 = normalized.slice(0, 10);
            setRecommendations(top10);
            sessionStorage.setItem('bideya_recommendations', JSON.stringify(top10));
        })();

        if (summary) setAdvisorSummary(summary);
        if (sid) setStudentId(sid);
        if (profileRaw) setProfile(JSON.parse(profileRaw));
        if (traceRaw) setTrace(JSON.parse(traceRaw));
        if (sessId) {
            setSessionId(sessId);
            const dismissed = sessionStorage.getItem(`bideya_pdf_dismissed_${sessId}`);
            if (!dismissed) {
                const timer = setTimeout(() => setShowPdfModal(true), 1200);
                return () => {
                    cancelled = true;
                    clearTimeout(timer);
                };
            }
        }

        return () => {
            cancelled = true;
        };
    }, [router, fallbackPath]);

    const handlePdfModalClose = () => {
        setShowPdfModal(false);
        if (sessionId) {
            sessionStorage.setItem(`bideya_pdf_dismissed_${sessionId}`, '1');
        }
    };

    const getAdmission = (rec: Pick<Recommendation, 'admission_probability' | 'admissionProbability'>) =>
        rec.admission_probability ?? rec.admissionProbability ?? null;

    const getRiskTier = (rec: Pick<Recommendation, 'risk_tier' | 'admission_probability' | 'admissionProbability'>): 'Safe' | 'Likely' | 'Reach' => {
        if (rec.risk_tier) return rec.risk_tier;
        const prob = getAdmission(rec);
        if (prob === null) return 'Likely';
        if (prob >= 0.7) return 'Safe';
        if (prob >= 0.4) return 'Likely';
        return 'Reach';
    };

    const riskLabel = (tier: string) => {
        const map: Record<string, Record<string, string>> = {
            Safe:   { tn: 'مضمون',  fr: 'Sûr',       en: 'Safe' },
            Likely: { tn: 'محتمل',  fr: 'Probable',   en: 'Likely' },
            Reach:  { tn: 'تحدي',   fr: 'Ambitieux',  en: 'Reach' },
        };
        return map[tier]?.[l] || tier;
    };

    const handleFeedback = async (rec: Recommendation, rating: number) => {
        const key = rec.id || rec.programId;
        try {
            const resp = await fetch(getApiUrl('/api/orientation/feedback'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recommendationId: key, studentId, programId: key, rating }),
            });
            if (resp.ok) setFeedbackSent((prev) => ({ ...prev, [key]: true }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleGlobalSatisfaction = async (rating: number) => {
        if (!sessionId || globalSatisfaction > 0) return;
        setGlobalSatisfaction(rating);
        await fetch(getApiUrl('/api/orientation/satisfaction'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, rating }),
        }).catch(() => null);
    };

    const formatFg = (v: number | null | undefined) =>
        v != null ? v.toFixed(2) : '—';

    const globalFg = trace?.orientation_score_fg
        ?? profile?.orientationScoreFg
        ?? profile?.fgSubjectMean
        ?? null;
    const fgLabels = getFgLabels(l);
    const regionGroups = groupRecommendationsByRegion(recommendations, profile ?? {}, globalFg);
    const regionGroupLabels = getRegionGroupLabels(l);
    let globalIdx = 0;

    if (!recommendations.length) return null;

    const renderRecommendationCard = (rec: Recommendation, idx: number) => {
        const key = rec.id || rec.programId || String(idx);
        const tier = getRiskTier(rec);
        const riskStyle = RISK_STYLES[tier];
        const RiskIcon = riskStyle.icon;
        const admission = getAdmission(rec);
        const display = getRecommendationDisplay(rec, l);
        const studentFgBase = getStudentFgBase(rec, globalFg);
        const studentFgBonus = getStudentFgWithBonus(rec, globalFg);
        const studentFg = studentFgBonus;
        const comparison = getFgComparison(studentFg, rec.admission_score_last, rec.admission_score_min, l);
        const insight = rec.llmExplanation
            || (!rec.explanation || isTechnicalExplanation(rec.explanation)
                ? buildMatchInsight(rec, l, globalFg)
                : rec.explanation);
        const dimensions = getScoreDimensions(l);
        const compColor = COMPARISON_COLORS[comparison.status];

        return (
            <div key={key}
                className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all overflow-hidden">
                {/* Card header */}
                <div className="p-6 pb-4 border-b border-slate-800/80">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shrink-0">
                            <GraduationCap className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="pr-4">
                                    <span className="text-xs font-bold text-indigo-400 mb-1 block">#{idx + 1}</span>
                                    <h3 className="text-xl font-bold text-white leading-tight">
                                        {display.title}
                                    </h3>
                                    {display.subtitle && (
                                        <p className="text-indigo-300/90 mt-1 font-medium">{display.subtitle}</p>
                                    )}
                                    {display.meta && (
                                        <p className="text-slate-400 mt-0.5 text-sm">{display.meta}</p>
                                    )}
                                    {!display.subtitle && !display.meta && display.university && (
                                        <p className="text-slate-400 mt-1">{display.university}</p>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                                        {Math.round(rec.score * 100)}% {labels.match}
                                    </span>
                                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}>
                                        <RiskIcon className="w-3 h-3" />
                                        {riskLabel(tier)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3 text-sm">
                                {rec.city && (
                                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                                        <MapPin className="w-3 h-3" />{rec.city}
                                    </span>
                                )}
                                {display.field && display.field !== display.specialty && (
                                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                        {display.field}
                                    </span>
                                )}
                                {admission !== null && (
                                    <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                        {labels.admission}: {Math.round(admission * 100)}%
                                    </span>
                                )}
                                {rec.geographic_bonus_applied && (
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                        +7% {labels.geoBonus}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {(rec.admission_score_last != null || studentFg != null) && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="w-4 h-4 text-yellow-400" />
                                <h4 className="text-sm font-bold text-white uppercase tracking-wide">{labels.official}</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                <StatCell icon={Target} label={fgLabels.fgBase} value={formatFg(studentFgBase)} />
                                <StatCell icon={Award} label={fgLabels.fgBonus} value={formatFg(studentFgBonus)} />
                                <StatCell icon={TrendingUp} label={fgLabels.last} value={formatFg(rec.admission_score_last)} />
                                <StatCell icon={BarChart3} label={fgLabels.min} value={formatFg(rec.admission_score_min)} />
                            </div>

                            {rec.geographic_bonus_applied && studentFgBase != null && studentFgBonus != null && studentFgBase !== studentFgBonus && (
                                <div className="mb-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-sm">
                                    <p className="text-emerald-400 font-medium">
                                        {getGeographicBonusLabel(rec.geographic_bonus_reason, l)}
                                    </p>
                                    <p className="text-slate-400 mt-1 text-xs">
                                        {fgLabels.fgBase}: {formatFg(studentFgBase)}
                                        {' → '}
                                        {fgLabels.fgBonus}: {formatFg(studentFgBonus)}
                                        {rec.geographic_bonus_points != null && ` (+${formatFg(rec.geographic_bonus_points)} pts)`}
                                    </p>
                                </div>
                            )}

                            {studentFg != null && rec.admission_score_last != null && (
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                                        <span>{fgLabels.min}: {formatFg(rec.admission_score_min)}</span>
                                        <span>{fgLabels.last}: {formatFg(rec.admission_score_last)}</span>
                                    </div>
                                    <div className="relative h-3 rounded-full bg-slate-800 overflow-hidden">
                                        <div
                                            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${compColor}`}
                                            style={{
                                                width: `${Math.min(100, Math.max(5, ((studentFg - (rec.admission_score_min ?? 0)) / Math.max(0.01, (rec.admission_score_last - (rec.admission_score_min ?? 0)))) * 100))}%`,
                                            }}
                                        />
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-yellow-400 shadow-lg"
                                            style={{
                                                left: `${Math.min(95, Math.max(5, ((studentFg - (rec.admission_score_min ?? 0)) / Math.max(0.01, (rec.admission_score_last - (rec.admission_score_min ?? 0)))) * 100))}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">{comparison.message}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-sm font-bold text-white">{labels.analysis}</h4>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{insight}</p>
                    </div>

                    {rec.score_breakdown && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-4 h-4 text-cyan-400" />
                                <h4 className="text-sm font-bold text-white">{labels.criteria}</h4>
                            </div>
                            <div className="space-y-3">
                                {dimensions.map(({ key, label, weight }) => {
                                    const val = rec.score_breakdown?.[key];
                                    if (typeof val !== 'number') return null;
                                    const color =
                                        key === 'interest'  ? 'bg-purple-500' :
                                        key === 'academic'  ? 'bg-yellow-500' :
                                        key === 'admission' ? 'bg-cyan-500'   :
                                        key === 'location'  ? 'bg-emerald-500':
                                        'bg-indigo-500';
                                    return (
                                        <div key={key}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-400">{label}</span>
                                                <span className="text-slate-300">{weight} — {Math.round(val * 100)}%</span>
                                            </div>
                                            <ScoreBar value={val} color={color} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                            {rec.degree && <span>{labels.diploma}: {rec.degree}</span>}
                            {rec.study_duration_years && <span>{labels.duration}: {rec.study_duration_years} {labels.years}</span>}
                            {rec.capacity && <span>{labels.capacity}: {rec.capacity} {labels.places}</span>}
                            {rec.language_of_study && <span>{labels.language}: {rec.language_of_study}</span>}
                        </div>
                        <div className="flex items-center gap-3">
                            {rec.website && (
                                <a href={rec.website} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300">
                                    <ExternalLink className="w-4 h-4" />{labels.visit}
                                </a>
                            )}
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} onClick={() => handleFeedback(rec, star)}
                                        disabled={feedbackSent[key]}
                                        className="p-0.5 transition-all hover:scale-110 disabled:cursor-default">
                                        <Star className={`w-5 h-5 ${feedbackSent[key] ? 'text-indigo-500 fill-indigo-500' : 'text-slate-600 hover:text-yellow-400 hover:fill-yellow-400'}`} />
                                    </button>
                                ))}
                            </div>
                            {feedbackSent[key] && (
                                <span className="text-sm text-emerald-400 font-medium">{t('feedback_thanks')}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-white mb-4">{t('results_title')}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-6">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                        {l === 'tn' ? `${recommendations.length} مؤسسة ننصحك بيها` :
                         l === 'fr' ? `${recommendations.length} institutions recommandées` :
                         `${recommendations.length} recommended institutions`}
                    </span>
                </div>
                {advisorSummary && (
                    <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-100 italic">
                        &ldquo;{advisorSummary}&rdquo;
                    </div>
                )}
            </div>

            {/* Student profile banner */}
            {(profile || globalFg) && (
                <div className="mb-8 p-4 rounded-xl bg-slate-900/60 border border-indigo-500/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {profile?.bacType && (
                            <div className="px-3 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                                <span className="text-[10px] text-indigo-300 block uppercase font-bold tracking-wider leading-none mb-1">{labels.section}</span>
                                <span className="font-bold text-white text-sm">{profile.bacType}</span>
                            </div>
                        )}
                        {profile?.bacAverage != null && (
                            <div className="px-3 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                                <span className="text-[10px] text-indigo-300 block uppercase font-bold tracking-wider leading-none mb-1">{labels.bacAvg}</span>
                                <span className="font-bold text-white text-sm">{profile.bacAverage.toFixed(2)}/20</span>
                            </div>
                        )}
                        {globalFg != null && (
                            <div className="px-3 py-1 rounded-lg bg-yellow-500/5 border border-yellow-500/15">
                                <span className="text-[10px] text-yellow-400 block uppercase font-bold tracking-wider leading-none mb-1">{labels.fgScore}</span>
                                <span className="font-bold text-yellow-400 text-sm">{formatFg(globalFg)}</span>
                            </div>
                        )}
                        {(profile?.homeRegion || profile?.region) && (
                            <div className="px-3 py-1 rounded-lg bg-slate-800/40 border border-slate-700/50">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider leading-none mb-1">
                                    {l === 'fr' ? 'Région du bac' : l === 'tn' ? 'ولاية الباك' : 'Bac region'}
                                </span>
                                <span className="font-bold text-slate-200 text-sm">{profile.homeRegion || profile.region}</span>
                            </div>
                        )}
                    </div>
                    {profile?.preferredRegions && profile.preferredRegions.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">
                                {l === 'fr' ? 'Régions préférées :' : l === 'tn' ? 'الولايات المفضلة :' : 'Preferred regions:'}
                            </span>
                            {profile.preferredRegions.map((r) => (
                                <span key={r} className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">{r}</span>
                            ))}
                        </div>
                    )}
                    {trace?.specialty_in_home_region === false && (
                        <div className="w-full text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2 mt-1">
                            {labels.specialtyAbsent} ({trace.geographic_bonus_rate || '+7%'} {labels.geoBonus})
                        </div>
                    )}
                </div>
            )}

            {/* Tableau comparatif FG vs guide officiel */}
            <ResultsComparisonTable
                recommendations={recommendations}
                studentFg={globalFg}
                lang={l}
                riskLabel={riskLabel}
                getRiskTier={getRiskTier}
                onSelectRecommendation={handleSelectRecommendation}
            />

            <div className="mt-12 pt-8 border-t border-slate-800 text-center">
                <button onClick={() => setShowChat(!showChat)}
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold hover:from-indigo-500 hover:to-cyan-500 transition-all shadow-lg">
                    <MessageCircle className="w-5 h-5" />
                    {l === 'tn' ? 'احكي مع Bideya AI' : l === 'fr' ? 'Parler avec Bideya AI' : 'Chat with Bideya AI'}
                </button>
                {showChat && studentId && <AiChat studentId={studentId} />}
            </div>

            <ResultsPdfModal
                open={showPdfModal}
                sessionId={sessionId}
                lang={l}
                onClose={handlePdfModalClose}
            />

            {/* Program detail slide-over */}
            <RecommendationDetailModal
                rec={selectedRec}
                lang={l}
                studentFg={globalFg}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onClose={handleCloseModal}
            />
        </div>
    );
}

export default function ResultsPage() {
    return <ResultsPageContent />;
}
