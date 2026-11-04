import { GoogleGenAI } from '@google/genai';
import { StorageService } from './storageService';

const MEDICAL_DISCLAIMER_PHRASE =
  'I can help explain information you have entered, but I cannot provide medical advice. Please check your prescription or contact your doctor or pharmacist.';

const SAFETY_SYSTEM_PROMPT = `You are MediTrack Assistant, a friendly, respectful digital guide embedded in MediTrack, an app for older adults and their families.

Your SOLE PURPOSE is to assist users with understanding and navigating the MediTrack app:
1. Explain how to add medicines, set reminder times, and mark doses as taken.
2. Explain how to invite trusted family members or caregivers and manage sharing permissions.
3. Summarize the user's recorded daily schedule or explain adherence logs in simple, warm, everyday language.
4. Help parse user-entered text (like typing "Take Lisinopril 10mg once a day with water at 8am") into structured medicine fields so the user can review and approve it.

STRICT MEDICAL BOUNDARIES & SAFETY RULES:
- You must NEVER diagnose medical conditions or symptoms.
- You must NEVER recommend medications, brands, supplements, or alterations.
- You must NEVER calculate or recommend medicine dosages.
- You must NEVER alter prescribed schedules or tell a user to take an extra or double dose if they missed or have an unconfirmed dose.
- If the user asks ANY medical, diagnostic, pharmacological, or dosage question, you MUST immediately respond with:
  "${MEDICAL_DISCLAIMER_PHRASE}"
- Tone: warm, patient, clear, respectful to elders. Never patronizing. Keep sentences clear and easy to read.`;

export async function askMediTrackAssistant(userPrompt: string): Promise<string> {
  // Check if AI consent was given
  const hasConsent = StorageService.getAiConsent();
  if (!hasConsent) {
    return 'Please enable AI consent in Settings to consult the MediTrack Assistant.';
  }

  // Check for immediate medical questions client-side as a safety boundary layer
  const lower = userPrompt.toLowerCase();
  const medicalTriggers = [
    'should i take',
    'double dose',
    'missed my dose what to do',
    'diagnose',
    'what medicine should',
    'side effect dangerous',
    'is this disease',
    'headache cure',
    'chest pain',
    'prescribe',
    'how many pills can i take'
  ];

  for (const trigger of medicalTriggers) {
    if (lower.includes(trigger)) {
      return MEDICAL_DISCLAIMER_PHRASE;
    }
  }

  // Check if server or environment has GEMINI_API_KEY
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY);

  if (!apiKey) {
    // Intelligent local assistant fallback for standard app navigation questions
    return generateLocalAssistantResponse(userPrompt);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SAFETY_SYSTEM_PROMPT,
        temperature: 0.3
      }
    });

    return response.text || generateLocalAssistantResponse(userPrompt);
  } catch (err) {
    console.warn('Gemini API call fell back to local assistant:', err);
    return generateLocalAssistantResponse(userPrompt);
  }
}

function generateLocalAssistantResponse(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes('add') && p.includes('medicine')) {
    return "To add a new medicine: click 'Medicines' in the navigation bar, then click the orange '+ Add Medicine' button. Enter your prescribed medicine name, dosage, instructions, and at least one reminder time (e.g., 08:00 AM). You can also attach a prescription document if you wish!";
  }

  if (p.includes('reminder') || p.includes('how do reminders work')) {
    return "MediTrack checks your medicine schedule every 15 seconds while the application is open. When it's time for your dose, a large, friendly popup appears. You can simply tap 'Taken' to record your dose, or tap 'Snooze' to be reminded again in 10 minutes.";
  }

  if (p.includes('family') || p.includes('caregiver') || p.includes('share')) {
    return "Family Care allows you to invite loved ones or caregivers. Go to the 'Family' page, tap 'Invite Member', and enter their name and email. Once they accept, you have full control to grant or stop sharing at any time. Caregivers can see your schedule and dose confirmations, but they can never change your medicine list.";
  }

  if (p.includes('today') || p.includes('schedule') || p.includes('summary')) {
    const medicines = StorageService.getMedicines();
    if (medicines.length === 0) {
      return "You do not have any medicines registered yet. Tap '+ Add Medicine' to get started.";
    }
    const medList = medicines.map(m => `• ${m.name} (${m.dosage}) at ${m.reminderTimes.join(', ')}`).join('\n');
    return `Here is your current prescribed routine:\n${medList}\n\nYou can view your full day timeline under 'Schedule'.`;
  }

  if (p.includes('adherence') || p.includes('progress') || p.includes('week')) {
    return "Your weekly adherence chart is available right on your Patient Dashboard and in the Health overview! It shows doses taken on time over the last 7 days. Consistency helps you and your doctor keep your health routine on track.";
  }

  return "I am your MediTrack assistant! I can help guide you through adding medicines, setting reminders, using Easy Mode, or inviting family members. How can I help you today?";
}
