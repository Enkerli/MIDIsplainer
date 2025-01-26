import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import _ from 'lodash';

const intervalToPc = {
  'R': 0,
  '♭2': 1, '2': 2, 
  '♭3': 3, '3': 4,
  '4': 5, '♯4': 6,
  '♭5': 6, '5': 7, '♯5': 8,
  '♭6': 8, '6': 9,
  '♭7': 10, '7': 11,
  '𝄫7': 9,
  '♭9': 1, '9': 2, '♯9': 3,
  '11': 5, '♯11': 6,
  '♭13': 8, '13': 9
};

const pcToBinary = pc => {
  const binary = new Array(12).fill('0');
  binary[pc] = '1';
  return binary.join('');
};

const ChordValidator = () => {
  const [results, setResults] = React.useState({ issues: [], duplicates: [] });

  React.useEffect(() => {
    const validateChords = async () => {
      try {
        const response = await window.fs.readFile('chord_dictionary.json', { encoding: 'utf8' });
        const chordDict = parseChordData(response);
        const issues = [];

        Object.entries(chordDict).forEach(([name, chord]) => {
          // Convert intervals to binary
          const pcsFromIntervals = chord.intervals.map(int => intervalToPc[int]);
          let expectedBinary = new Array(12).fill('0');
          pcsFromIntervals.forEach(pc => expectedBinary[pc] = '1');
          expectedBinary = expectedBinary.join('');
          
          if (chord.binary !== expectedBinary) {
            issues.push({
              chord: name,
              type: 'Interval/Binary mismatch',
              current: chord.binary,
              expected: expectedBinary,
              intervals: chord.intervals,
              pcs: chord.pcs
            });
          }

          // Verify decimal
          const decimal = parseInt(chord.binary, 2);
          if (decimal !== chord.decimal) {
            issues.push({
              chord: name,
              type: 'Decimal mismatch',
              binary: chord.binary,
              calculated: decimal,
              given: chord.decimal
            });
          }
        });

        setResults({
          issues: _.sortBy(issues, ['type', 'chord']),
          duplicates: []
        });
      } catch (error) {
        console.error('Error:', error);
        setResults({
          issues: [{ chord: 'ERROR', type: 'Processing Error', message: error.toString() }],
          duplicates: []
        });
      }
    };

    validateChords();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Issues ({results.issues.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.issues.map((issue, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <p className="font-semibold">{issue.chord}: {issue.type}</p>
                {issue.message ? (
                  <p className="text-red-500">{issue.message}</p>
                ) : issue.type === 'Interval/Binary mismatch' ? (
                  <>
                    <p className="mt-2">Intervals: [{issue.intervals.join(', ')}]</p>
                    <p className="mt-1">PCs: [{issue.pcs.join(', ')}]</p>
                    <div className="font-mono text-sm mt-2">
                      <p>Current:  {issue.current}</p>
                      <p>Expected: {issue.expected}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-mono text-sm mt-2">{issue.binary}</p>
                    <p>Calculated decimal: {issue.calculated}</p>
                    <p>Given decimal: {issue.given}</p>
                  </>
                )}
              </div>
            ))}
            {results.issues.length === 0 && (
              <p className="text-gray-600">No issues found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const parseChordData = (text) => {
  const chordDict = {};
  let currentChord = null;
  let currentContent = '';
  let bracketCount = 0;

  text.split('\n').forEach(line => {
    if (line.match(/^\s*"[^"]+": {$/)) {
      if (currentChord && currentContent) {
        try {
          chordDict[currentChord] = JSON.parse(currentContent + '}');
        } catch (e) {
          console.warn(`Failed to parse ${currentChord}:`, e);
        }
      }
      currentChord = line.match(/"([^"]+)"/)[1];
      currentContent = '{';
      bracketCount = 1;
    } else if (currentChord) {
      bracketCount += (line.match(/{/g) || []).length;
      bracketCount -= (line.match(/}/g) || []).length;
      
      if (bracketCount === 0) {
        currentContent += line;
        try {
          chordDict[currentChord] = JSON.parse(currentContent);
        } catch (e) {
          console.warn(`Failed to parse ${currentChord}:`, e);
        }
        currentChord = null;
        currentContent = '';
      } else {
        currentContent += line;
      }
    }
  });

  return chordDict;
};

export default ChordValidator;