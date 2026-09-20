// Vocabulary generator for authentic educational English words with Bangla translations
// covering adjectives, verbs, and essential primary/secondary curriculum vocabulary.

import fs from 'fs';
import path from 'path';

// Load existing adjectivesData
const currentFile = fs.readFileSync('src/data/adjectivesData.ts', 'utf8');

console.log('Script started');
