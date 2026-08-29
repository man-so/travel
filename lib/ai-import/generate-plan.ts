import { aiImportJsonSchema, aiImportPlanSchema } from '@/lib/ai-import/schema';
import { generate } from '@/lib/llm';
import type { AiImportPlan, AiImportRequest } from '@/lib/ai-import/schema';

export type ExtractedContent = {
  title: string;
  url: string;
  text: string;
};

function buildPrompt({
  content,
  journey,
  clarificationChoice,
}: {
  content: ExtractedContent;
  journey: AiImportRequest['journey'];
  clarificationChoice?: string;
}) {
  const clarificationRule = clarificationChoice
    ? `
CRITICAL USER DECISION:
The user has already answered the clarification.
Selected option: "${clarificationChoice}"

Because a user clarification choice is provided:
- You must return status "plan".
- You must not return status "clarification".
- question must be null.
- options must be [].
- days must contain the final itinerary for the current ${journey.dayCount}-day Journey.
- Do not ask about Naoshima again.
`.trim()
    : `
No user clarification choice has been provided yet.
If the article contains an important optional path such as Naoshima, return status "clarification" with days [].
`.trim();

  return `
You are WAYLOG's travel content importer.

Turn the supplied travel article into a structured draft plan for review.
This is not a summary. Extract travel intent, places, options, and day-level plan candidates.

${clarificationRule}

Rules:
- Output JSON only.
- The output must match the supplied JSON schema exactly.
- The top-level itinerary array key must be "days". Do not use a "plan" key.
- The top-level "options" field must be an array of strings only. Do not return option objects.
- The top-level "status" must be exactly one of "clarification" or "plan".
- Use status "clarification" only when the article has real competing choices or when article duration conflicts with the current Journey day count.
- If the article has one clear course, output status "plan".
- If durationDays is known and differs from current Journey dayCount (${journey.dayCount}), set status "clarification", requiresDurationConfirmation true, and ask whether to keep the current Journey days or adapt the imported plan.
- If any important choice remains, set status "clarification", write a clear question, fill options as string[], and leave days empty.
- Do not place optional choices into days before the user chooses.
- If Naoshima is optional or requires extending/changing the trip, ask for clarification and do not include Naoshima in days.
- Only when no clarification is needed, set status "plan" and fill days with the final itinerary.
- If the user chose to include Naoshima as a day trip, include Naoshima in the final days.
- If the user chose to focus on Takamatsu and its surroundings, exclude Naoshima from the final days.
- Do not invent place_id, address, latitude, or longitude.
- Do not include coordinates or addresses in the JSON.
- Places directly found in the article must use source "article".
- Extra reasonable suggestions may use source "ai_suggestion", but keep them sparse.
- Day numbers start at 1.
- Keep categories short, e.g. attraction, restaurant, cafe, hotel, shopping, nature, activity.
- destination should be the article destination if clear, otherwise the Journey destination.
- Only include concrete place names that can be validated by Google Places.
- Do not include generic activities, meals, hotel areas, transport notes, or vague items as places.
- Do not include entries such as "udon", "light meal", "station area accommodation", "port area", "nearby restaurant", or "hotel".
- Do not combine alternatives in one place name. Avoid "or" and choose only after clarification.
- If a concrete place is not named, skip that item instead of inventing a venue.
- Good place examples: "Ritsurin Garden", "Yashima Observatory", "Takamatsu Castle", "Naoshima".
- Bad place examples: "Udon", "Takamatsu Station area accommodation", "Yashima Observatory or Takamatsu Castle".

Required examples:

Clarification example:
{
  "status": "clarification",
  "contentType": "travel_article",
  "destination": "Takamatsu",
  "durationDays": 3,
  "question": "나오시마를 일정에 포함할까요?",
  "options": [
    "다카마쓰 중심으로 여유롭게 여행",
    "나오시마 당일치기 포함"
  ],
  "days": []
}

Plan example:
{
  "status": "plan",
  "contentType": "travel_article",
  "destination": "Takamatsu",
  "durationDays": 3,
  "question": null,
  "options": [],
  "days": [
    {
      "day": 1,
      "places": [
        {
          "name": "Ritsurin Garden",
          "category": "nature",
          "source": "article"
        }
      ]
    }
  ]
}

Current Journey:
- destination: ${journey.destination}
- country: ${journey.country || 'unknown'}
- startDate: ${journey.startDate || 'unknown'}
- endDate: ${journey.endDate || 'unknown'}
- dayCount: ${journey.dayCount}

Source URL: ${content.url}
Source title: ${content.title || 'untitled'}

Readable content:
${content.text}
`.trim();
}

export async function generateAiImportPlan({
  content,
  journey,
  clarificationChoice,
}: {
  content: ExtractedContent;
  journey: AiImportRequest['journey'];
  clarificationChoice?: string;
}): Promise<AiImportPlan> {
  const raw = await generate({
    prompt: buildPrompt({ content, journey, clarificationChoice }),
    jsonSchema: aiImportJsonSchema,
  });

  const parsed = JSON.parse(raw) as unknown;
  return aiImportPlanSchema.parse(parsed);
}
