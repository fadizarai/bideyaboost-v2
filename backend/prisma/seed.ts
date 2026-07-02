import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '.prisma/client'
import fs from 'fs'
import path from 'path'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Tunisia Bac Types
const ALL_BAC_TYPES = ['math', 'science', 'tech', 'info', 'eco', 'letters'];

// Map field/specialty keywords to required Bac types
function inferBacTypes(field: string, specialty: string): string[] {
    const f = field?.toLowerCase() || '';
    const s = specialty?.toLowerCase() || '';
    const combined = `${f} ${s}`;

    // Engineering & Preparatory Classes - require Math, Science, Tech, Info
    if (combined.includes('préparatoire') || combined.includes('ingénieur') || combined.includes('polytechnique')) {
        return ['math', 'science', 'tech', 'info'];
    }

    // Computer Science / IT
    if (combined.includes('informatique') || combined.includes('computer') || combined.includes('logiciel') || 
        combined.includes('data') || combined.includes('multimedia') || combined.includes('réseaux')) {
        return ['math', 'science', 'tech', 'info'];
    }

    // Mathematics
    if (combined.includes('mathématique') || combined.includes('math ')) {
        return ['math', 'science', 'tech'];
    }

    // Physics / Chemistry
    if (combined.includes('physique') || combined.includes('chimie') || combined.includes('physics')) {
        return ['math', 'science', 'tech'];
    }

    // Biology / Life Sciences / Medicine / Pharmacy
    if (combined.includes('biologie') || combined.includes('médecine') || combined.includes('pharmacie') ||
        combined.includes('sciences de la vie') || combined.includes('santé') || combined.includes('vétérinaire')) {
        return ['science', 'math'];
    }

    // Economics / Management / Business
    if (combined.includes('économie') || combined.includes('gestion') || combined.includes('commerce') ||
        combined.includes('finance') || combined.includes('comptabilité') || combined.includes('management') ||
        combined.includes('business') || combined.includes('marketing')) {
        return ['eco', 'math', 'science', 'tech'];
    }

    // Law
    if (combined.includes('droit') || combined.includes('juridique') || combined.includes('law')) {
        return ['eco', 'letters', 'math', 'science'];
    }

    // Arts / Humanities / Languages / Literature
    if (combined.includes('lettres') || combined.includes('langue') || combined.includes('littérature') ||
        combined.includes('philosophie') || combined.includes('histoire') || combined.includes('arts') ||
        combined.includes('traduction') || combined.includes('civilisation')) {
        return ['letters', 'eco'];
    }

    // Architecture / Design
    if (combined.includes('architecture') || combined.includes('urbanisme') || combined.includes('design')) {
        return ['math', 'tech', 'science'];
    }

    // Agriculture
    if (combined.includes('agricole') || combined.includes('agronomie') || combined.includes('agriculture')) {
        return ['science', 'math', 'tech'];
    }

    // Sports / Physical Education
    if (combined.includes('sport') || combined.includes('éducation physique') || combined.includes('eps')) {
        return ALL_BAC_TYPES; // Open to all
    }

    // Tourism / Hospitality
    if (combined.includes('tourisme') || combined.includes('hôtellerie') || combined.includes('restauration')) {
        return ['eco', 'letters', 'tech'];
    }

    // Communication / Journalism / Media
    if (combined.includes('communication') || combined.includes('journalisme') || combined.includes('média')) {
        return ['letters', 'eco', 'info'];
    }

    // Technology / Technical fields
    if (combined.includes('technologie') || combined.includes('technique') || combined.includes('électronique') ||
        combined.includes('mécanique') || combined.includes('électrique') || combined.includes('génie')) {
        return ['tech', 'math', 'science', 'info'];
    }

    // Default: open to major technical/scientific bacs
    return ['math', 'science', 'tech', 'eco'];
}

// Normalize domain names
function normalizeDomain(field: string): string {
    const f = field?.toLowerCase() || '';
    
    if (f.includes('informatique') || f.includes('technologie')) return 'Informatique et Technologies';
    if (f.includes('fondamentale') || f.includes('mathématique') || f.includes('physique') || f.includes('chimie')) return 'Sciences Fondamentales';
    if (f.includes('vie') || f.includes('biologie')) return 'Sciences de la Vie';
    if (f.includes('préparatoire')) return 'Classes Préparatoires';
    if (f.includes('médecine') || f.includes('santé') || f.includes('pharmacie')) return 'Sciences de la Santé';
    if (f.includes('économie') || f.includes('gestion') || f.includes('commerce')) return 'Économie et Gestion';
    if (f.includes('droit') || f.includes('juridique')) return 'Droit et Sciences Politiques';
    if (f.includes('lettres') || f.includes('langue') || f.includes('littérature')) return 'Lettres et Langues';
    if (f.includes('ingénieur') || f.includes('génie')) return 'Sciences de l\'Ingénieur';
    if (f.includes('arts') || f.includes('design')) return 'Arts et Design';
    if (f.includes('sport')) return 'Sciences du Sport';
    if (f.includes('agriculture') || f.includes('agronomie')) return 'Sciences Agronomiques';
    if (f.includes('architecture')) return 'Architecture et Urbanisme';
    if (f.includes('communication') || f.includes('journalism')) return 'Sciences de l\'Information';
    
    return field || 'Autres';
}

async function main() {
    console.log('🇹🇳 Seeding Tunisian University Programs...')

    try {
        const rawSpecialties = fs.readFileSync(path.join(__dirname, 'specialties_structured.json'), 'utf-8');
        const specialties = JSON.parse(rawSpecialties);

        console.log(`📚 Found ${specialties.length} specialty records.`);

        // Clear existing
        await prisma.program.deleteMany({});
        console.log('🧹 Cleared existing programs.');

        const validSpecialties = specialties.filter((s: any) => s.specialty && s.university);
        console.log(`✅ Valid records with specialty and university: ${validSpecialties.length}`);

        const mappedData = validSpecialties.map((spec: any) => {
            // Handle the admission score string mapping
            let minScore: number | null = null;
            if (spec.admission_score_min && typeof spec.admission_score_min === 'number') {
                minScore = spec.admission_score_min;
            } else if (spec.admission_score_min && typeof spec.admission_score_min === 'string') {
                const parsed = parseFloat(spec.admission_score_min);
                minScore = isNaN(parsed) ? null : parsed;
            }

            // Infer required bac types based on field and specialty
            const bacTypes = inferBacTypes(spec.field || '', spec.specialty || '');

            // Normalize domain
            const domain = normalizeDomain(spec.field || '');

            return {
                university: spec.university,
                faculty: spec.institution || null,
                specialty: spec.specialty,
                domain: domain,
                minBacAverage: minScore,
                requiredBacTypes: bacTypes,
                durationYears: spec.study_duration_years || null,
                description: spec.degree || null,
                city: spec.city || null,
            };
        });

        // Use createMany for fast seeding
        const result = await prisma.program.createMany({
            data: mappedData,
            skipDuplicates: true
        });

        console.log(`✅ Successfully seeded ${result.count} programs.`);

        // Log domain distribution
        const domainCounts: Record<string, number> = {};
        for (const prog of mappedData) {
            domainCounts[prog.domain] = (domainCounts[prog.domain] || 0) + 1;
        }
        console.log('\n📊 Domain Distribution:');
        Object.entries(domainCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([domain, count]) => {
                console.log(`   ${domain}: ${count}`);
            });

    } catch (err) {
        console.error('❌ Could not load seed data.', err);
    }

    console.log('\n🎉 Seed completed.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
