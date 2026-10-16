export type TExercise = {
  version: number;
  id: string;
  name: string;
  amount: string;
  sets: number | null;
  youtubeLinks: string[];
  memo: string;
};

export type TExerciseValues = Omit<TExercise, 'id' | 'version'>;
