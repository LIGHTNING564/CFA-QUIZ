export type QuizOption = {
  label: string;
  value: string;
};

export type QuizQuestion = {
  question_number: number;
  total_questions: number;
  question_id: number;
  text: string;
  options: QuizOption[];
  correct_answer: string;
  explanation: string;
  reference: string;
};

export type Topic = {
  id: string | number;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Quiz = {
  id: string | number;
  topic_id: string | number;
  title: string;
  content: QuizQuestion[];
  question_count: number;
  created_at: string;
  updated_at: string;
};
