import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export interface StudentProfile {
    bacType: string;
    bacAverage: number;
    psychotechScore?: number;
    interests: string[];
}

export interface ProgramInfo {
    university: string;
    specialty: string;
    domain: string;
}

export class AiAdvisorService {
    private model = google('gemini-1.5-flash');

    async generatePersonalizedExplanation(student: StudentProfile, program: ProgramInfo): Promise<string> {
        try {
            const { text } = await generateText({
                model: this.model,
                prompt: `
                    You are a professional university orientation advisor for students in Tunisia.
                    A student has the following profile:
                    - Baccalauréat Type: ${student.bacType}
                    - Average Score: ${student.bacAverage}/20
                    - Psychometric Score: ${student.psychotechScore || 'N/A'}
                    - Interests: ${student.interests.join(', ')}

                    Based on this profile, explain why the following university program might be a good fit for them:
                    - University: ${program.university}
                    - Specialty: ${program.specialty}
                    - Domain: ${program.domain}

                    Keep your response concise (2-3 sentences), encouraging, and professional. 
                    Focus on the match between their interests and the program's domain.
                `,
            });
            return text.trim();
        } catch (error) {
            console.error('Error generating AI explanation:', error);
            return "Based on your unique profile and competitive score, this program offers a strong potential for your career goals.";
        }
    }

    async generateRecommendationsSummary(student: StudentProfile, programs: ProgramInfo[]): Promise<string> {
        try {
            const programList = programs.map(p => `- ${p.specialty} at ${p.university}`).join('\n');
            const { text } = await generateText({
                model: this.model,
                prompt: `
                    You are a professional university orientation advisor.
                    A student with these interests: ${student.interests.join(', ')} 
                    has been recommended these top programs:
                    ${programList}

                    Provide a very short (max 40 words) summary or encouraging message about these options 
                    that highlights how they align with their future aspirations.
                `,
            });
            return text.trim();
        } catch (error) {
            console.error('Error generating summary:', error);
            return "These programs have been selected based on your academic excellence and personal interests.";
        }
    }

    async getChatResponse(student: StudentProfile, messages: any[]): Promise<any> {
        try {
            const { text } = await generateText({
                model: this.model,
                system: `
                    You are "Bideya AI", a professional university and career orientation advisor in Tunisia.
                    The student has the following profile:
                    - Bac Type: ${student.bacType}
                    - Average: ${student.bacAverage}/20
                    - Interests: ${student.interests.join(', ')}

                    Be encouraging, helpful, and specific to the Tunisian education system (Universities, ISET, Prep schools, Medicine, etc.).
                    Answer their questions about career paths, university life, and how to reach their goals.
                `,
                messages,
            });
            return { text };
        } catch (error) {
            console.error('Chat error:', error);
            throw new Error('Chat advisor is currently unavailable');
        }
    }
}
