import _ from 'lodash';

// Read and parse the chord dictionary
async function validateChordDictionary() {
    const response = await window.fs.readFile('chord_dictionary.json', { encoding: 'utf8' });
    const chordDict = JSON.parse(response);
    const issues = [];

    // Utility functions for note/interval conversions
    const intervalToSemitones = {
        'R': 0, '♭2': 1, '2': 2, '♭3': 3, '3': 4, '4': 5, '♯4': 6,
        '♭5': 6, '5': 7, '♯5': 8, '♭6': 8, '6': 9, '♭7': 10, '7': 11,
        '♭9': 1, '9': 2, '♯9': 3, '11': 5, '♯11': 6, '♭13': 8, '13': 9,
        '𝄫7': 9 // Double-flat 7
    };

    const noteToPC = {
        'C': 0, 'C♯': 1, 'D♭': 1, 'D': 2, 'D♯': 3, 'E♭': 3, 'E': 4,
        'F': 5, 'F♯': 6, 'G♭': 6, 'G': 7, 'G♯': 8, 'A♭': 8, 'A': 9,
        'A♯': 10, 'B♭': 10, 'B': 11, 'B𝄫': 9
    };

    // Check each chord
    for (const [chordName, chord] of Object.entries(chordDict)) {
        // Convert intervals to pitch classes
        const intervalPCs = chord.intervals.map(int => intervalToSemitones[int]);
        if (!_.isEqual(_.sortBy(intervalPCs), _.sortBy(chord.pcs))) {
            issues.push({
                chord: chordName,
                issue: 'Interval/PCS mismatch',
                intervals: chord.intervals,
                intervalPCs: _.sortBy(intervalPCs),
                givenPCs: _.sortBy(chord.pcs)
            });
        }

        // Convert notes to pitch classes
        const notePCs = chord.notes.map(note => noteToPC[note]);
        if (!_.isEqual(_.sortBy(notePCs), _.sortBy(chord.pcs))) {
            issues.push({
                chord: chordName,
                issue: 'Notes/PCS mismatch',
                notes: chord.notes,
                notePCs: _.sortBy(notePCs),
                givenPCs: _.sortBy(chord.pcs)
            });
        }

        // Check binary representation
        const binary = chord.binary;
        const pcsFromBinary = [];
        for (let i = 0; i < 12; i++) {
            if (binary[11 - i] === '1') {
                pcsFromBinary.push(i);
            }
        }
        if (!_.isEqual(_.sortBy(pcsFromBinary), _.sortBy(chord.pcs))) {
            issues.push({
                chord: chordName,
                issue: 'Binary/PCS mismatch',
                binary: binary,
                binaryPCs: _.sortBy(pcsFromBinary),
                givenPCs: _.sortBy(chord.pcs)
            });
        }

        // Check decimal representation
        const decimalFromBinary = parseInt(binary, 2);
        if (decimalFromBinary !== chord.decimal) {
            issues.push({
                chord: chordName,
                issue: 'Binary/Decimal mismatch',
                binary: binary,
                calculatedDecimal: decimalFromBinary,
                givenDecimal: chord.decimal
            });
        }

        // Find duplicate pitch class sets
        const pcsKey = _.sortBy(chord.pcs).join(',');
        if (!duplicatePCS[pcsKey]) {
            duplicatePCS[pcsKey] = [];
        }
        duplicatePCS[pcsKey].push(chordName);
    }

    // Report duplicates
    const duplicates = Object.entries(duplicatePCS)
        .filter(([_, chords]) => chords.length > 1);

    console.log('Issues found:', issues);
    console.log('Chords with identical pitch class sets:', duplicates);
}

validateChordDictionary().catch(console.error);