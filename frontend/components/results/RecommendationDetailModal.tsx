'use client';

import { useEffect, useRef } from 'react';
import {
  X, GraduationCap, MapPin, BookOpen, Briefcase, Star, Award,
  TrendingUp, BarChart3, ChevronRight, Clock, Globe, Code2,
  FlaskConical, Target, Layers, CheckCircle2, AlertTriangle,
  Users, DollarSign, Cpu, Brain,
} from 'lucide-react';
import { getRecommendationDisplay } from '@/lib/recommendation-display';

type Lang = 'tn' | 'fr' | 'en';

type CourseEntry = {
  semester?: number | string;
  year?: number | string;
  code?: string;
  name?: string;
  name_fr?: string;
  name_ar?: string;
  credits?: number;
  hours?: number;
  type?: string;
};

type SkillEntry = {
  id?: string;
  name?: string;
  name_fr?: string;
  category?: string;
  level?: string;
};

type CareerEntry = {
  title?: string;
  title_fr?: string;
  salary_min?: number;
  salary_max?: number;
  demand?: string;
  sector?: string;
};

type Requirements = {
  bac_types?: string[];
  min_bac_score?: number;
  required_subjects?: string[];
  preferred_subjects?: string[];
  notes?: string;
};

type ProgramDetails = {
  id?: string;
  slug?: string;
  difficulty?: number;
  math_intensity?: number;
  programming_intensity?: number;
  physics_intensity?: number;
  employment_rate?: number;
  riasec_profile?: string;
  mbti_recommended?: string[];
  holland_codes?: string[];
  keywords?: string[];
  tags?: string[];
  curriculum?: CourseEntry[];
  skills?: SkillEntry[];
  careers?: CareerEntry[];
  requirements?: Requirements;
};

type Recommendation = {
  institution?: string;
  university?: string;
  specialty?: string;
  field?: string;
  city?: string;
  degree?: string;
  study_duration_years?: number;
  capacity?: number | null;
  language_of_study?: string;
  orientation_code?: string;
  academic_year?: string;
  admission_score_last?: number | null;
  student_orientation_score?: number | null;
  student_orientation_score_base?: number | null;
  bonus_applied?: boolean | null;
  score_difference?: number | null;
  score?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: ProgramDetails | null | any;
};

type ActiveTab = 'overview' | 'curriculum' | 'careers' | 'requirements';

type Props = {
  rec: Recommendation | null;
  lang: Lang;
  studentFg?: number | null;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onClose: () => void;
};

function IntensityBar({ value, color }: { value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value * 10));
  return (
    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function ScoreDiffBadge({ diff, lang }: { diff: number | null | undefined; lang: Lang }) {
  if (diff == null) return null;
  const sign = diff >= 0 ? '+' : '';
  const color =
    diff >= 10 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
    diff >= 4  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' :
    diff >= -4 ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' :
               'bg-red-500/15 text-red-300 border-red-500/30';
  const label =
    diff >= 10 ? (lang === 'fr' ? 'Très sûr' : lang === 'tn' ? 'مضمون جداً' : 'Very safe') :
    diff >= 4  ? (lang === 'fr' ? 'Sûr' : lang === 'tn' ? 'مضمون' : 'Safe') :
    diff >= -4 ? (lang === 'fr' ? 'Cible' : lang === 'tn' ? 'مستهدف' : 'Target') :
                 (lang === 'fr' ? 'Ambitieux' : lang === 'tn' ? 'طموح' : 'Reach');
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border border-slate-700 ${color}`}>
      {sign}{diff.toFixed(2)} pts - {label}
    </span>
  );
}

function OverviewTab({ rec, lang }: { rec: Recommendation; lang: Lang }) {
  const d = rec.details as ProgramDetails | null;
  const l = lang;

  const items = [
    { icon: GraduationCap, label: l === 'fr' ? 'Diplôme' : l === 'tn' ? 'الشهادة' : 'Degree', value: rec.degree },
    { icon: Clock,         label: l === 'fr' ? 'Durée' : l === 'tn' ? 'المدة' : 'Duration', value: rec.study_duration_years ? `${rec.study_duration_years} ${l === 'fr' ? 'ans' : l === 'tn' ? 'سنوات' : 'years'}` : undefined },
    { icon: Users,         label: l === 'fr' ? 'Capacité' : l === 'tn' ? 'طاقة الاستيعاب' : 'Capacity', value: rec.capacity ? `${rec.capacity}` : undefined },
    { icon: Globe,         label: l === 'fr' ? 'Langue' : l === 'tn' ? 'لغة التدريس' : 'Language', value: rec.language_of_study },
    { icon: Target,        label: l === 'fr' ? 'Code' : l === 'tn' ? 'الرمز' : 'Code', value: rec.orientation_code },
    { icon: Award,         label: l === 'fr' ? 'Année' : l === 'tn' ? 'السنة' : 'Year', value: rec.academic_year },
  ].filter(item => item.value);

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
        <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-yellow-400" />
          {l === 'fr' ? 'Analyse des scores' : l === 'tn' ? 'تحليل الأعداد' : 'Score analysis'}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-500 mb-1">{l === 'fr' ? 'FG brut' : l === 'tn' ? 'FG خام' : 'Raw FG'}</p>
            <p className="text-xl font-black text-slate-200 tabular-nums">
              {rec.student_orientation_score_base != null ? rec.student_orientation_score_base.toFixed(2) : rec.student_orientation_score != null ? rec.student_orientation_score.toFixed(2) : '---'}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">{l === 'fr' ? 'sans bonif.' : l === 'tn' ? 'بدون بونوس' : 'no bonus'}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <p className="text-xs text-yellow-400/80 mb-1">{l === 'fr' ? 'FG +7%' : l === 'tn' ? 'FG +7%' : 'FG +7%'}</p>
            <p className="text-xl font-black text-yellow-400 tabular-nums">
              {rec.student_orientation_score != null ? rec.student_orientation_score.toFixed(2) : '---'}
            </p>
            <p className="text-[10px] text-yellow-400/50 mt-0.5">{l === 'fr' ? 'avec bonif.' : l === 'tn' ? 'مع بونوس' : 'with bonus'}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-500 mb-1">{l === 'fr' ? 'Dernier admis' : l === 'tn' ? 'آخر مقبول' : 'Last admitted'}</p>
            <p className="text-xl font-black text-white tabular-nums">
              {rec.admission_score_last != null ? rec.admission_score_last.toFixed(2) : '---'}
            </p>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-500 mb-1">{l === 'fr' ? 'Écart' : l === 'tn' ? 'الفارق' : 'Gap'}</p>
            <p className={`text-xl font-black tabular-nums ${(rec.score_difference ?? 0) >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {rec.score_difference != null ? `${rec.score_difference >= 0 ? '+' : ''}${rec.score_difference.toFixed(2)}` : '---'}
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <ScoreDiffBadge diff={rec.score_difference} lang={lang} />
        </div>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Icon className="w-3 h-3" />{label}
              </div>
              <p className="text-sm font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      )}

      {d && (
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            {l === 'fr' ? 'Profil académique' : l === 'tn' ? 'الملف الأكاديمي' : 'Academic profile'}
          </h4>
          <div className="space-y-3">
            {d.math_intensity != null && (
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="flex items-center gap-1 text-slate-400"><Target className="w-3 h-3 text-blue-400" />{l === 'fr' ? 'Intensité Maths' : l === 'tn' ? 'كثافة الرياضيات' : 'Math intensity'}</span>
                  <span className="text-blue-400 font-bold">{d.math_intensity}/10</span>
                </div>
                <IntensityBar value={d.math_intensity} color="bg-blue-500" />
              </div>
            )}
            {d.programming_intensity != null && (
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="flex items-center gap-1 text-slate-400"><Cpu className="w-3 h-3 text-emerald-400" />{l === 'fr' ? 'Programmation' : l === 'tn' ? 'البرمجة' : 'Programming'}</span>
                  <span className="text-emerald-400 font-bold">{d.programming_intensity}/10</span>
                </div>
                <IntensityBar value={d.programming_intensity} color="bg-emerald-500" />
              </div>
            )}
            {d.physics_intensity != null && (
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="flex items-center gap-1 text-slate-400"><FlaskConical className="w-3 h-3 text-cyan-400" />{l === 'fr' ? 'Physique' : l === 'tn' ? 'الفيزياء' : 'Physics'}</span>
                  <span className="text-cyan-400 font-bold">{d.physics_intensity}/10</span>
                </div>
                <IntensityBar value={d.physics_intensity} color="bg-cyan-500" />
              </div>
            )}
            {d.difficulty != null && (
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="flex items-center gap-1 text-slate-400"><AlertTriangle className="w-3 h-3 text-amber-400" />{l === 'fr' ? 'Difficulté' : l === 'tn' ? 'الصعوبة' : 'Difficulty'}</span>
                  <span className="text-amber-400 font-bold">{d.difficulty}/10</span>
                </div>
                <IntensityBar value={d.difficulty} color="bg-amber-500" />
              </div>
            )}
          </div>
          {d.employment_rate != null && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">{l === 'fr' ? "Taux d'emploi" : l === 'tn' ? 'نسبة التشغيل' : 'Employment rate'}</p>
                <p className="text-lg font-black text-emerald-400">{Math.round(d.employment_rate * 100)}%</p>
              </div>
            </div>
          )}
          {d.riasec_profile && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500">{l === 'fr' ? 'Profil RIASEC :' : l === 'tn' ? 'ملف RIASEC:' : 'RIASEC profile:'}</span>
              {d.riasec_profile.split('').map((ch: string) => (
                <span key={ch} className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-bold">{ch}</span>
              ))}
            </div>
          )}
          {d.tags && d.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {d.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs">{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CurriculumTab({ rec, lang }: { rec: Recommendation; lang: Lang }) {
  const d = rec.details as ProgramDetails | null;
  const l = lang;
  const courses = d?.curriculum ?? [];

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <BookOpen className="w-12 h-12 mb-3 opacity-30" />
        <p>{l === 'fr' ? 'Programme détaillé non disponible' : l === 'tn' ? 'البرنامج الدراسي غير متوفر' : 'Detailed curriculum not available'}</p>
      </div>
    );
  }

  const grouped: Record<string, CourseEntry[]> = {};
  for (const c of courses) {
    const key = c.semester != null ? `S${c.semester}` : c.year != null ? `Year ${c.year}` : 'Other';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  }

  const typeColor = (type?: string) => {
    if (!type) return 'bg-slate-700/50 text-slate-400';
    const t = type.toLowerCase();
    if (t.includes('core') || t.includes('obligatoire')) return 'bg-indigo-500/15 text-indigo-300';
    if (t.includes('elective') || t.includes('optionnel')) return 'bg-cyan-500/15 text-cyan-300';
    if (t.includes('lab') || t.includes('tp')) return 'bg-emerald-500/15 text-emerald-300';
    return 'bg-slate-700/50 text-slate-400';
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([sem, cs]) => (
        <div key={sem}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">{sem.replace(/[^0-9SY]/g, '')}</span>
            <h5 className="text-sm font-bold text-white">{sem}</h5>
            <span className="text-xs text-slate-500">{cs.length} {l === 'fr' ? 'matières' : l === 'tn' ? 'مواد' : 'subjects'}</span>
          </div>
          <div className="space-y-2">
            {cs.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white leading-snug">{c.name_fr ?? c.name ?? '---'}</p>
                  {c.code && <p className="text-xs text-slate-500 mt-0.5">{c.code}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.credits != null && (
                    <span className="text-xs text-yellow-400 font-bold">{c.credits} cr</span>
                  )}
                  {c.type && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${typeColor(c.type)}`}>{c.type}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CareersTab({ rec, lang }: { rec: Recommendation; lang: Lang }) {
  const d = rec.details as ProgramDetails | null;
  const l = lang;
  const careers = d?.careers ?? [];
  const skills = d?.skills ?? [];

  if (careers.length === 0 && skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <Briefcase className="w-12 h-12 mb-3 opacity-30" />
        <p>{l === 'fr' ? 'Données carrières non disponibles' : l === 'tn' ? 'معطيات المهن غير متوفرة' : 'Career data not available'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {careers.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            {l === 'fr' ? 'Débouchés professionnels' : l === 'tn' ? 'الآفاق المهنية' : 'Career opportunities'}
          </h4>
          <div className="space-y-3">
            {careers.map((c: CareerEntry, i: number) => {
              const demandColor =
                c.demand === 'high'   ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' :
                c.demand === 'medium' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25' :
                                        'text-slate-400 bg-slate-800 border-slate-700';
              return (
                <div key={i} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{c.title_fr ?? c.title ?? '---'}</p>
                      {c.sector && <p className="text-xs text-slate-500 mt-0.5">{c.sector}</p>}
                    </div>
                    {c.demand && (
                      <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full border font-semibold ${demandColor}`}>
                        {c.demand === 'high' ? (l === 'fr' ? 'Forte demande' : l === 'tn' ? 'طلب مرتفع' : 'High demand') :
                         c.demand === 'medium' ? (l === 'fr' ? 'Demande modérée' : l === 'tn' ? 'طلب متوسط' : 'Medium demand') :
                         (l === 'fr' ? 'Faible demande' : l === 'tn' ? 'طلب ضعيف' : 'Low demand')}
                      </span>
                    )}
                  </div>
                  {(c.salary_min != null || c.salary_max != null) && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                      <DollarSign className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-yellow-400 font-bold tabular-nums">
                        {c.salary_min != null ? `${c.salary_min.toLocaleString()} TND` : ''}
                        {c.salary_min != null && c.salary_max != null ? ' - ' : ''}
                        {c.salary_max != null ? `${c.salary_max.toLocaleString()} TND` : ''}
                      </span>
                      <span className="text-xs text-slate-500">{l === 'fr' ? '/ an' : l === 'tn' ? '/ سنة' : '/ yr'}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-purple-400" />
            {l === 'fr' ? 'Compétences acquises' : l === 'tn' ? 'المهارات المكتسبة' : 'Skills acquired'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((s: SkillEntry, i: number) => {
              const catColor =
                s.category === 'technical'    ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' :
                s.category === 'soft'         ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                s.category === 'language'     ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' :
                s.category === 'scientific'   ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                                                'bg-slate-800 text-slate-400 border-slate-700';
              return (
                <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${catColor}`}>
                  {s.name_fr ?? s.name ?? '---'}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RequirementsTab({ rec, lang }: { rec: Recommendation; lang: Lang }) {
  const d = rec.details as ProgramDetails | null;
  const l = lang;
  const req = d?.requirements as Requirements | null | undefined;

  if (!req) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <CheckCircle2 className="w-12 h-12 mb-3 opacity-30" />
        <p>{l === 'fr' ? "Conditions d'accès non disponibles" : l === 'tn' ? 'شروط القبول غير متوفرة' : 'Requirements not available'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {req.bac_types && req.bac_types.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            {l === 'fr' ? 'Sections du bac acceptées' : l === 'tn' ? 'شعب الباكالوريا المقبولة' : 'Accepted bac types'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {req.bac_types.map((bt: string) => (
              <span key={bt} className="px-3 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-sm font-bold">{bt}</span>
            ))}
          </div>
        </div>
      )}

      {req.min_bac_score != null && (
        <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-center gap-3">
          <Award className="w-5 h-5 text-yellow-400 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">{l === 'fr' ? 'Moyenne minimale requise' : l === 'tn' ? 'المعدل الأدنى المطلوب' : 'Minimum average required'}</p>
            <p className="text-xl font-black text-yellow-400">{req.min_bac_score}/20</p>
          </div>
        </div>
      )}

      {req.required_subjects && req.required_subjects.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            {l === 'fr' ? 'Matières obligatoires' : l === 'tn' ? 'المواد الإجبارية' : 'Required subjects'}
          </h4>
          <div className="space-y-2">
            {req.required_subjects.map((s: string) => (
              <div key={s} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm text-slate-300">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {req.preferred_subjects && req.preferred_subjects.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            {l === 'fr' ? 'Matières recommandées' : l === 'tn' ? 'المواد الموصى بها' : 'Preferred subjects'}
          </h4>
          <div className="space-y-2">
            {req.preferred_subjects.map((s: string) => (
              <div key={s} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-sm text-slate-300">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {req.notes && (
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <p className="text-sm text-amber-200/90 leading-relaxed">{req.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function RecommendationDetailModal({ rec, lang, activeTab, onTabChange, onClose }: Props) {
  const l = lang;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = rec ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [rec]);

  if (!rec) return null;

  const tabs: { id: ActiveTab; label: string; icon: typeof BookOpen }[] = [
    { id: 'overview',     label: l === 'fr' ? "Vue d'ensemble" : l === 'tn' ? 'لمحة عامة' : 'Overview',    icon: Layers },
    { id: 'curriculum',   label: l === 'fr' ? 'Programme'      : l === 'tn' ? 'البرنامج الدراسي'   : 'Curriculum',  icon: BookOpen },
    { id: 'careers',      label: l === 'fr' ? 'Carrières'      : l === 'tn' ? 'الآفاق المهنية' : 'Careers', icon: Briefcase },
    { id: 'requirements', label: l === 'fr' ? 'Conditions'     : l === 'tn' ? 'شروط القبول'     : 'Requirements', icon: CheckCircle2 },
  ];

  const display = getRecommendationDisplay(rec, lang);
  const title = display.subtitle ?? display.field ?? '---';
  const subtitle = display.institution;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl flex flex-col bg-slate-900 border-l border-slate-700/80 shadow-2xl shadow-black/50 animate-in slide-in-from-right duration-300">
        <div className="flex-shrink-0 px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-indigo-950/60 to-slate-900">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white leading-tight truncate">{title}</h2>
              {subtitle && <p className="text-sm text-indigo-300/80 mt-0.5 truncate">{subtitle}</p>}
              {display.city && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                  <MapPin className="w-3 h-3" />{display.city}
                  {display.university && display.university !== display.institution && (
                    <span className="ml-2 text-slate-500">. {display.university}</span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          {rec.score != null && (
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-sm font-bold">
                <Star className="w-3.5 h-3.5" />
                {Math.round(rec.score * 100)}% {l === 'fr' ? 'compatibilité' : l === 'tn' ? 'تطابق' : 'match'}
              </span>
              <ScoreDiffBadge diff={rec.score_difference} lang={lang} />
            </div>
          )}
        </div>

        <div className="flex-shrink-0 px-4 py-3 border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
          <div className="flex gap-1.5">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === 'overview'     && <OverviewTab     rec={rec} lang={lang} />}
          {activeTab === 'curriculum'   && <CurriculumTab   rec={rec} lang={lang} />}
          {activeTab === 'careers'      && <CareersTab      rec={rec} lang={lang} />}
          {activeTab === 'requirements' && <RequirementsTab rec={rec} lang={lang} />}
        </div>

        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {l === 'fr' ? "Source : Guide officiel d'orientation universitaire Tunisie 2025"
            : l === 'tn' ? 'المصدر: التوجيه الجامعي الرسمي تونس 2025'
            : 'Source: Official Tunisian University Orientation Guide 2025'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
          >
            {l === 'fr' ? 'Fermer' : l === 'tn' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </>
  );
}
