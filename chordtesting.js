import React, { useState, useEffect } from 'react';
import _ from 'lodash';

const ChordTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [selectedChord, setSelectedChord] = useState('');

  // Reference data for proper note spelling
  const letterSequence = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const accidentals = ['𝄫', '♭', '', '♯', '𝄪']; // Double-flat to double-sharp
  
  // Helper to get letter index accounting for accidentals
  const getLetterIndex = (note) => {
    const letter = note.charAt(0);
    return letterSequence.indexOf(letter);
  };

  // Helper to get next letter name
  const getNextLetter = (letter, steps) => {
    const currentIndex = letterSequence.indexOf(letter);
    return letterSequence[(currentIndex + steps + 7) % 7];
  };

  // Helper to determine proper accidental
  const getAccidental = (targetPC, naturalPC) => {
    const diff = (targetPC - naturalPC + 12) % 12;
    switch (diff) {
      case 0: return '';
      case 1: return '♯';
      case 2: return '𝄪';
      case 10: return '♭';
      case 11: return '𝄫';
      default: return '?';
    }
  };

  // Function to spell a note properly given a target pitch class and previous letter
  const spellNote = (pc, prevLetter = null, chordType = '') => {
    // Get proper letter based on chord structure
    const letterSteps = {
      0: 0, // root
      2: 1, // second/ninth
      4: 2, // major third
      3: 2, // minor third
      5: 3, // fourth/eleventh
      6: 4, // diminished fifth
      7: 4, // perfect fifth
      8: 5, // augmented fifth / minor sixth
      9: 5, // major sixth / minor seventh
      10: 6, // minor seventh
      11: 6  // major seventh
    }[pc] || 0;

    // Get base letter
    let letter;
    if (prevLetter) {
      letter = getNextLetter(prevLetter, letterSteps);
    } else {
      letter = letterSequence[letterSteps];
    }

    // Calculate natural pitch class for this letter
    const naturalPC = {
      'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
    }[letter];

    // Determine accidental
    const accidental = getAccidental(pc, naturalPC);

    return letter + accidental;
  };

  // Test specific chord spellings
  const testChord = (root, quality) => {
    const chordData = {
      root,
      quality,
      // Add more test data as needed
    };

    // Test note spelling
    const result = {
      chord: `${root}${quality}`,
      expectedNotes: [], // Add expected notes
      actualNotes: [], // Calculate actual notes
      passed: false
    };

    setTestResults(prev => [...prev, result]);
  };

  // UI rendering
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Chord Analysis Tester</h2>
      
      <div className="mb-4">
        <select 
          className="p-2 border rounded"
          value={selectedChord}
          onChange={(e) => setSelectedChord(e.target.value)}
        >
          <option value="">Select a chord to test</option>
          <option value="Baug">Baug</option>
          <option value="Ebdim">Ebdim</option>
          <option value="G7b5">G7b5</option>
        </select>
        
        <button 
          className="ml-2 p-2 bg-blue-500 text-white rounded"
          onClick={() => selectedChord && testChord(...selectedChord.match(/([A-G][b#]?)(.*)/).slice(1))}
        >
          Test Chord
        </button>
      </div>

      <div className="space-y-2">
        {testResults.map((result, i) => (
          <div 
            key={i}
            className={`p-2 rounded ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}
          >
            <div className="font-bold">{result.chord}</div>
            <div>Expected: {result.expectedNotes.join(', ')}</div>
            <div>Actual: {result.actualNotes.join(', ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChordTester;