// Chord Dictionary Transposer
// Converts chord qualities from C to any root note while preserving proper note spellings

const intervalToPc = {
  'R': 0, '♭2': 1, '2': 2, '♭3': 3, '3': 4, '4': 5, '♯4': 6,
  '♭5': 6, '5': 7, '♯5': 8, '♭6': 8, '6': 9, '♭7': 10, '7': 11,
  '𝄫7': 9, '♭9': 1, '9': 2, '♯9': 3, '11': 5, '♯11': 6, '♭13': 8, '13': 9
};

const noteToPc = {
  'C': 0, 'C♯': 1, 'D♭': 1, 'D': 2, 'D♯': 3, 'E♭': 3, 'E': 4,
  'F': 5, 'F♯': 6, 'G♭': 6, 'G': 7, 'G♯': 8, 'A♭': 8, 'A': 9,
  'A♯': 10, 'B♭': 10, 'B': 11
};

function getPC(note) {
  // Handle double accidentals
  if (note.includes('𝄪') || note.includes('♯♯')) {
    const baseLetter = note[0];
    const basePC = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 }[baseLetter];
    return (basePC + 2) % 12;
  }
  if (note.includes('♭♭')) {
    const baseLetter = note[0];
    const basePC = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 }[baseLetter];
    return (basePC - 2 + 12) % 12;
  }

  // Handle single accidentals
  const letter = note[0];
  const basePC = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 }[letter];
  
  if (note.includes('♯')) return (basePC + 1) % 12;
  if (note.includes('♭')) return (basePC - 1 + 12) % 12;
  return basePC;
}

function transposeNote(root, cNote) {
  if (root === 'C') return cNote;

  const interval = getPC(cNote);
  const rootPC = getPC(root);
  const targetPC = (interval + rootPC) % 12;

  // Get letter name based on root letter
  const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const rootLetterIndex = letters.indexOf(root[0]);
  const cNoteLetterIndex = letters.indexOf(cNote[0]);
  const targetLetterIndex = (rootLetterIndex + cNoteLetterIndex) % 7;
  const targetLetter = letters[targetLetterIndex];

  // Calculate required accidentals
  const naturalPC = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 }[targetLetter];
  const needed = (targetPC - naturalPC + 12) % 12;

  if (needed === 0) return targetLetter;
  if (needed === 1) return targetLetter + '♯';
  if (needed === 2) return targetLetter + '𝄪';
  if (needed === 11) return targetLetter + '♭';
  if (needed === 10) return targetLetter + '♭♭';
  return targetLetter;
}

function transposeChord(root, quality, chordData) {
  if (!chordData[quality]) return null;
  const chord = chordData[quality];

  // If root is C, use the exact notes from JSON
  if (root === 'C') {
    return {
      ...chord,
      notes: chord.notes,
      pcs: chord.pcs,
      binary: chord.binary,
      decimal: chord.decimal
    };
  }

  // Otherwise transpose from C
  const transposedNotes = chord.notes.map(cNote => transposeNote(root, cNote));
  const pcs = transposedNotes.map(note => getPC(note));
  
  // Generate binary from PCs
  const binary = Array(12).fill('0');
  pcs.forEach(pc => binary[pc] = '1');
  const binaryStr = binary.join('');
  
  return {
    ...chord,
    notes: transposedNotes,
    pcs,
    binary: binaryStr,
    decimal: parseInt(binaryStr, 2)
  };
}

// Example usage:
/*
const baseNotes = [
  'C', 'C♯', 'D♭', 'D', 'D♯', 'E♭', 'E', 'F',
  'F♯', 'G♭', 'G', 'G♯', 'A♭', 'A', 'A♯', 'B♭', 'B'
];

// Load chord dictionary
fetch('chord_dictionary.json')
  .then(response => response.json())
  .then(chordData => {
    // Get all transpositions for a chord quality
    const transpositions = baseNotes.map(root => ({
      root,
      chord: transposeChord(root, 'min7', chordData)
    }));
    console.log(transpositions);
  });
*/

// Export for use as a module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    transposeChord,
    transposeNote,
    getPC,
    intervalToPc,
    noteToPc
  };
}