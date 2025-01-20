Find this function in the file:

// Get chord notes in the right order
function getChordNotes(root, intervals, quality = '') {
    console.log('getChordNotes input:', { root, intervals, quality });
    // Order the intervals first
    const orderedIntervals = getOrderedIntervals(intervals, 0, quality);
    console.log('getChordNotes orderedIntervals:', orderedIntervals);

    // Root letter and standard letter sequence
    const rootLetter = root.charAt(0);
    const letterNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

Replace it with:

// Get chord notes in the right order
function getChordNotes(root, intervals, quality = '') {
    console.log('getChordNotes input:', { root, intervals, quality });
    // Order the intervals first
    const orderedIntervals = getOrderedIntervals(intervals, 0, quality);
    console.log('getChordNotes orderedIntervals:', orderedIntervals);

    // Root letter and standard letter sequence
    const rootLetter = root.charAt(0);
    const letterNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

    // Helper to determine letter steps based on interval and chord quality
    function getLetterSteps(interval, quality) {
        // Special handling for augmented chords
        if (quality.includes('aug') && interval === 8) return 4; // aug 5th uses same letter as perfect 5th
        
        switch (interval) {
            case 2:  return 1;  // second = 1 letter up
            case 3:  return 2;  // minor third = 2 letters up
            case 4:  return 2;  // major third = 2 letters up
            case 5:  return 3;  // perfect fourth = 3 letters up
            case 6:  return 4;  // dim fifth = 4 letters up
            case 7:  return 4;  // perfect fifth = 4 letters up
            case 8:  return 5;  // augmented fifth / minor sixth = 5 letters up
            case 9:  return 5;  // major sixth = 5 letters up
            case 10: return 6;  // minor seventh = 6 letters up
            case 11: return 6;  // major seventh = 6 letters up
            default: return Math.floor(interval * 2/3);
        }
    }

    // Helper to determine accidental based on context
    function getAccidental(desiredPC, naturalPC, interval, quality, root) {
        const diff = (desiredPC - naturalPC + 12) % 12;
        const rootHasFlat = root.includes('b');
        const rootHasSharp = root.includes('#');
        
        // Special handling for augmented fifth
        if (quality.includes('aug') && interval === 8) {
            return '𝄪';  // double sharp for augmented fifth
        }
        
        // Special handling for diminished chords
        if (quality.includes('dim') && (interval === 3 || interval === 6 || interval === 9)) {
            if (diff === 11) return '𝄫';  // double flat for diminished intervals
            return '♭';  // single flat otherwise
        }

        switch (diff) {
            case 0:  return '';
            case 1:  return rootHasFlat ? '♭' : '♯';  // Prefer matching root accidental
            case 2:  return '𝄪';  // double sharp
            case 10: return '♭';
            case 11: return '𝄫';  // double flat
            default: return '';
        }
    }

    const result = orderedIntervals.map(interval => {
        if (interval === 0) return root;

        // Get target letter
        const steps = getLetterSteps(interval, quality);
        const rootIndex = letterNames.indexOf(rootLetter);
        const targetLetter = letterNames[(rootIndex + steps) % 7];
        const naturalPC = noteToPC[targetLetter];
        const desiredPC = (noteToPC[root] + interval) % 12;

        // Get proper accidental
        const accidental = getAccidental(desiredPC, naturalPC, interval, quality, root);

        return targetLetter + accidental;
    });

    console.log('getChordNotes output:', result);
    return result;
}