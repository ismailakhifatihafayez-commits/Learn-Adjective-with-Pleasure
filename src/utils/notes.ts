const NOTES_STORAGE_KEY = 'adjective_mnemonic_notes';

export interface UserNotesMap {
  [wordLower: string]: {
    text: string;
    updatedAt: string;
  };
}

export const getAllNotes = (): UserNotesMap => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const getNoteForWord = (word: string): string => {
  if (!word) return '';
  const notes = getAllNotes();
  const entry = notes[word.trim().toLowerCase()];
  return entry ? entry.text : '';
};

export const saveNoteForWord = (word: string, noteText: string): void => {
  if (!word) return;
  if (typeof window === 'undefined') return;
  try {
    const notes = getAllNotes();
    const cleanWord = word.trim().toLowerCase();
    const cleanText = noteText.trim();

    if (!cleanText) {
      delete notes[cleanWord];
    } else {
      notes[cleanWord] = {
        text: cleanText,
        updatedAt: new Date().toISOString(),
      };
    }
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Storage quota or error fallback
  }
};

export const deleteNoteForWord = (word: string): void => {
  if (!word) return;
  if (typeof window === 'undefined') return;
  try {
    const notes = getAllNotes();
    delete notes[word.trim().toLowerCase()];
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // ignore
  }
};
