# CFA Question Bank Admin

Admin-only V1 for creating Topics and JSON-backed Quizzes.

## What is included

- Topics list + topic creation
- Quizzes inside topics
- JSON quiz editor with Monaco
- Zod validation + business-rule validation
- Live quiz preview
- Create / edit / delete quizzes
- Supabase-ready data layer
- Local JSON fallback for development when Supabase env vars are not configured

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000/admin

## Supabase mode

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local`.
4. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
5. Restart the dev server.

The service-role key is server-only. Do not commit it or expose it to client-side code.

## Current content contract

Each quiz's `content` is an array of:

```json
{
  "question_number": 1,
  "total_questions": 44,
  "question_id": 1572658,
  "text": "Question text",
  "options": [
    { "label": "A", "value": "Option A" },
    { "label": "B", "value": "Option B" },
    { "label": "C", "value": "Option C" }
  ],
  "correct_answer": "C",
  "explanation": "Explanation",
  "reference": "Module 1.3, LOS 1.d"
}
```

No student-facing experience, authentication, attempts, analytics, or document upload is included in this version.
