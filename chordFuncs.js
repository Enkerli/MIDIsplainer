// Interval definitions for both pitch class and letter steps
const intervalMap = {
	'R':    { letters: 0, semitones: 0 },
	'♭2':   { letters: 1, semitones: 1 },
	'2':    { letters: 1, semitones: 2 },
	'♭3':   { letters: 2, semitones: 3 },
	'3':    { letters: 2, semitones: 4 },
	'4':    { letters: 3, semitones: 5 },
	'♯4':   { letters: 3, semitones: 6 },
	'♭5':   { letters: 4, semitones: 6 },
	'5':    { letters: 4, semitones: 7 },
	'♯5':   { letters: 4, semitones: 8 },
	'♭6':   { letters: 5, semitones: 8 },
	'6':    { letters: 5, semitones: 9 },
	'𝄫7':   { letters: 6, semitones: 9 },
	'♭7':   { letters: 6, semitones: 10 },
	'7':    { letters: 6, semitones: 11 },
	'♭9':   { letters: 1, semitones: 1 },
	'9':    { letters: 1, semitones: 2 },
	'♯9':   { letters: 1, semitones: 3 },
	'11':   { letters: 3, semitones: 5 },
	'♯11':  { letters: 3, semitones: 6 },
	'♭13':  { letters: 5, semitones: 8 },
	'13':   { letters: 5, semitones: 9 }
};

// Add this in the script section, before any function that uses it
const intervalToPosition = {
	'R': 0, 
	'♭2': 1, '2': 2, '♯2': 3,
	'♭3': 3, '3': 4, 
	'4': 5, '♯4': 6,
	'♭5': 6, '5': 7, '♯5': 8,
	'♭6': 8, '6': 9,
	'𝄫7': 9, '♭7': 10, '7': 11,
	'♭9': 1, '9': 2, '♯9': 3,
	'11': 5, '♯11': 6,
	'♭13': 8, '13': 9
};


const qualitySelect = document.getElementById('qualitySelect');
const rootSelect = document.getElementById('rootSelect');
const resultDiv = document.getElementById('result');

let chordData = {};

function getPC(note) {
	const letterPCs = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
	const baseLetter = note[0];
	const basePC = letterPCs[baseLetter];
	
	if (note.includes('𝄫')) return (basePC - 2 + 12) % 12;
	if (note.includes('𝄪')) return (basePC + 2) % 12;
	if (note.includes('♭♭')) return (basePC - 2 + 12) % 12;
	if (note.includes('♯')) return (basePC + 1) % 12;
	if (note.includes('♭')) return (basePC - 1 + 12) % 12;
	return basePC;
}

function buildNoteFromInterval(root, interval) {
	const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
	const letterPCs = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
	
	// Get root letter index
	const rootIndex = letters.indexOf(root[0]);
	
	// Calculate target letter using interval's letter steps
	const targetLetterIndex = (rootIndex + interval.letters) % 7;
	const targetLetter = letters[targetLetterIndex];
	
	// Calculate target PC using root's PC plus interval's semitones
	const rootPC = getPC(root);
	const targetPC = (rootPC + interval.semitones) % 12;
	
	// Calculate needed alteration
	const naturalPC = letterPCs[targetLetter];
	const alteration = (targetPC - naturalPC + 12) % 12;
	
	// Return the note with appropriate accidental
	if (alteration === 0) return targetLetter;
	if (alteration === 1) return targetLetter + '♯';
	if (alteration === 2) return targetLetter + '𝄪';
	if (alteration === 10) return targetLetter + '𝄫';
	if (alteration === 11) return targetLetter + '♭';
	
	console.warn('Unexpected alteration:', alteration);
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

	// Build each note from intervals
	const transposedNotes = chord.intervals.map(intervalName => {
		const interval = intervalMap[intervalName];
		return buildNoteFromInterval(root, interval);
	});

	// Calculate pitch classes
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

// Load chord dictionary
fetch('chord_dictionary.json')
	.then(response => response.json())
	.then(data => {
		chordData = data;
		// Populate quality select
		Object.keys(data).sort().forEach(quality => {
			const option = document.createElement('option');
			option.value = quality;
			option.textContent = quality;
			qualitySelect.appendChild(option);
		});
	})
	.catch(error => console.error('Error loading chord data:', error));


function updateChordDisplay() {
	const root = rootSelect.value;
	const quality = qualitySelect.value;

	if (!quality) {
		// Create empty grid
		createEmptyGrid();
		// Clear all text fields
		document.getElementById('chordTitle').textContent = 'Select a chord';
		document.getElementById('fullName').textContent = 'Full name:';
		document.getElementById('aliases').textContent = 'Aliases:';
		document.getElementById('intervals').textContent = 'Intervals:';
		document.getElementById('notes').textContent = 'Notes:';
		document.getElementById('pcs').textContent = 'Pitch Classes:';
		document.getElementById('forteNumber').textContent = 'Forte Number:';
		document.getElementById('binary').textContent = 'Binary:';
		document.getElementById('decimal').textContent = 'Decimal:';
		document.getElementById('altSpellings').style.display = 'none';
		document.getElementById('namedInversions').style.display = 'none';
		return;
	}

	const chord = transposeChord(root, quality, chordData);
	if (!chord) return;

	// Update visualizations
	document.getElementById('chordCircle').innerHTML = createChordCircle(root, chord.intervals, chord);
    createChromaticGrid(root, chord, window.useSecondPosition);

	// Update text fields
	document.getElementById('chordTitle').textContent = `${root}${chordData[quality].displayName || quality}`;
	document.getElementById('fullName').textContent = `Full Name: ${chord.fullName}`;
	document.getElementById('aliases').textContent = `Aliases: [${chord.aliases.join(', ')}]`;
	document.getElementById('intervals').textContent = `Intervals: [${chord.intervals.join(', ')}]`;
	document.getElementById('notes').textContent = `Notes: [${chord.notes.join(', ')}]`;
	document.getElementById('pcs').textContent = `Pitch Classes: [${chord.pcs.join(', ')}]`;
	document.getElementById('forteNumber').textContent = `Forte Number: ${chord.forteNumber}`;
	document.getElementById('binary').textContent = `Binary: ${chord.binary}`;
	document.getElementById('decimal').textContent = `Decimal: ${chord.decimal}`;

	// Get inversions and alternative spellings
	const roots = ['C', 'C♯', 'D♭', 'D', 'D♯', 'E♭', 'E', 'F', 'F♯', 'G♭', 'G', 'G♯', 'A♭', 'A', 'A♯', 'B♭', 'B'];
	const inversions = findSpecificInversions(root, quality, roots, chordData);

	if (inversions.length > 0) {
		const altSpellings = inversions
			.filter(inv => inv.interval === 0)
			.map(spelling => `${spelling.chord} [${spelling.notes.join(', ')}]`);

		const trueInversions = inversions
			.filter(inv => inv.interval !== 0)
			.map(inv => `${inv.chord} [${inv.notes.join(', ')}]`);

		if (altSpellings.length > 0) {
			document.getElementById('altSpellings').textContent = 
				`Alternative Spellings: ${altSpellings.join('; ')}`;
			document.getElementById('altSpellings').style.display = 'block';
		} else {
			document.getElementById('altSpellings').style.display = 'none';
		}

		if (trueInversions.length > 0) {
			const invElement = document.getElementById('namedInversions');
			invElement.innerHTML = `Named Inversions:<br>${trueInversions.join('<br>')}`;
			invElement.style.display = 'block';
		} else {
			document.getElementById('namedInversions').style.display = 'none';
		}
	} else {
		document.getElementById('altSpellings').style.display = 'none';
		document.getElementById('namedInversions').style.display = 'none';
	}
}


rootSelect.addEventListener('change', updateChordDisplay);
qualitySelect.addEventListener('change', updateChordDisplay);

function findNamedInversions() {
	let decimalMap = {};
	let namedInversionsMap = {};

	const roots = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
	const semitoneMap = {
		"C": 0, "C♯": 1, "D": 2, "D♯": 3, "E": 4, "F": 5, "F♯": 6, 
		"G": 7, "G♯": 8, "A": 9, "A♯": 10, "B": 11
	};

	Object.keys(chordData).forEach(quality => {
		roots.forEach(root => {
			let transposed = transposeChord(root, quality, chordData);
			if (!transposed) return;

			let decimal = transposed.decimal;
			let chordIdentifier = root + " " + quality;

			if (!decimalMap[decimal]) {
				decimalMap[decimal] = [];
			}
			decimalMap[decimal].push({ root: root, quality: quality });
		});
	});

	Object.keys(decimalMap).forEach(decimal => {
		if (decimalMap[decimal].length > 1) {
			let chords = decimalMap[decimal];

			chords.forEach(chord => {
				let chordQuality = chord.quality;
				if (!namedInversionsMap[chordQuality]) {
					namedInversionsMap[chordQuality] = [];
				}

				chords.forEach(otherChord => {
					if (otherChord.quality !== chord.quality || otherChord.root !== chord.root) {
						let interval = (semitoneMap[otherChord.root] - semitoneMap[chord.root] + 12) % 12;
						let inversionEntry = `(${interval})${otherChord.quality}`;
						if (!namedInversionsMap[chordQuality].includes(inversionEntry)) {
							namedInversionsMap[chordQuality].push(inversionEntry);
						}
					}
				});
			});
		}
	});

	return namedInversionsMap;
}

// Helper function to compare sets
function setsEqual(set1, set2) {
	if (set1.size !== set2.size) return false;
	for (const item of set1) {
		if (!set2.has(item)) return false;
	}
	return true;
}

// Find specific inversions with full details
function findSpecificInversions(root, quality, roots, chordData) {
	const inversions = [];
	const currentChord = transposeChord(root, quality, chordData);
	if (!currentChord) return inversions;

	const currentPCs = new Set(currentChord.pcs);

	roots.forEach(otherRoot => {
		Object.keys(chordData).forEach(otherQuality => {
			if (root === otherRoot && quality === otherQuality) return;
	
			const otherChord = transposeChord(otherRoot, otherQuality, chordData);
			if (!otherChord) return;

			const otherPCs = new Set(otherChord.pcs);
	
			// Check if pitch class sets are equal
			if (setsEqual(currentPCs, otherPCs)) {
				// Calculate interval between roots
				const interval = (getPC(otherRoot) - getPC(root) + 12) % 12;
		
				inversions.push({
					interval,
					chord: `${otherRoot}${otherQuality}`,
					intervals: otherChord.intervals,
					notes: otherChord.notes,
					pcs: otherChord.notes.map(note => getPC(note))
				});
			}
		});
	});

	// Sort by interval
	return inversions.sort((a, b) => a.interval - b.interval);
}


// Format inversion for display
function formatInversion(inv) {
	return `(${inv.interval}), ${inv.chord}, [${inv.intervals.join(', ')}], [${inv.notes.join(', ')}], [${inv.pcs.join(', ')}]`;
}

// Update export function
function exportChordDictionary() {
	const selectedFields = Array.from(document.querySelectorAll('.export-field:checked'))
		.map(checkbox => checkbox.value);

	const roots = ['C', 'C♯', 'D♭', 'D', 'D♯', 'E♭', 'E', 'F', 'F♯', 'G♭', 'G', 'G♯', 'A♭', 'A', 'A♯', 'B♭', 'B'];
	let exportData = {};

	Object.keys(chordData).forEach(quality => {
		let chord = chordData[quality];
		let exportedChord = {};

		selectedFields.forEach(field => {
			if (field !== "transpositions") {
				exportedChord[field] = chord[field];
			}
		});

		if (selectedFields.includes("transpositions")) {
			exportedChord.transpositions = {};
			roots.forEach(root => {
				let transposed = transposeChord(root, quality, chordData);
				if (!transposed) return;
		
				exportedChord.transpositions[root] = {
					intervals: transposed.intervals,
					notes: transposed.notes,
					pcs: transposed.pcs.sort((a, b) => a - b)
				};

				// Add specific inversions and alternative spellings if they exist
				const specificInversions = findSpecificInversions(root, quality, roots, chordData);
				if (specificInversions.length > 0) {
					const altSpellings = specificInversions
						.filter(inv => inv.interval === 0)
						.map(alt => ({
							chord: alt.chord,
							notes: alt.notes
						}));
			
					const trueInversions = specificInversions.filter(inv => inv.interval !== 0);
			
					if (altSpellings.length > 0) {
						exportedChord.transpositions[root].alternativeSpellings = altSpellings;
					}
			
					if (trueInversions.length > 0) {
						exportedChord.transpositions[root].namedInversions = trueInversions;
					}
				}
			});
		}

		exportData[quality] = exportedChord;
	});

	const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(jsonBlob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "chord_dictionary_export.json";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

document.getElementById('chordInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const input = this.value.trim();
        if (!input) return;

        // Check if input starts with a root note
        const match = input.match(/^([A-G][b#♭♯]?)(.*)$/);
        
        let root, quality;
        if (match) {
            // If there's a root note, parse as before
            [_, rootRaw, qualityRaw] = match;
            root = rootRaw.replace(/b/g, '♭').replace(/#/g, '♯');
            quality = qualityRaw;
        } else {
            // No root note - use C as default
            root = 'C';
            quality = input;
        }

        // Find the main quality - first check if it's a direct key
        let mainQuality = quality;

        if (!chordData[mainQuality]) {
            // If not a direct key, look through aliases
            for (let key in chordData) {
                if (chordData[key].aliases && 
                    chordData[key].aliases.includes(quality)) {
                    mainQuality = key;
                    break;
                }
            }
        }

        // Update select elements if values exist
        if (rootSelect.querySelector(`option[value="${root}"]`) && 
            qualitySelect.querySelector(`option[value="${mainQuality}"]`)) {
            rootSelect.value = root;
            qualitySelect.value = mainQuality;
            updateChordDisplay();
        }
    }
});


rootSelect.addEventListener('change', updateChordDisplay);
qualitySelect.addEventListener('change', updateChordDisplay);

// Initialize display when page loads
document.addEventListener('DOMContentLoaded', function() {
	createEmptyGrid();
});

// Add initial state setup to hide toggle notes button
document.addEventListener('DOMContentLoaded', function() {
    createEmptyGrid();
    document.getElementById('toggleNotesDisplay').style.display = 'none';
});

// Update toggle position visibility with view toggle
document.getElementById('toggleView').addEventListener('click', function() {
    const circleDiv = document.getElementById('chordCircle');
    const gridDiv = document.querySelector('.grid-viz');
    const toggleNotesBtn = document.getElementById('toggleNotesDisplay');
    const togglePositionBtn = document.getElementById('togglePosition');

    if (circleDiv.style.display === 'none') {
        // Switching to circle view
        gridDiv.style.display = 'none';
        circleDiv.style.display = 'block';
        toggleNotesBtn.style.display = 'block';
        togglePositionBtn.style.display = 'none';
        this.textContent = 'Switch to Grid View';
    } else {
        // Switching to grid view
        gridDiv.style.display = 'block';
        circleDiv.style.display = 'none';
        toggleNotesBtn.style.display = 'none';
        togglePositionBtn.style.display = 'block';
        this.textContent = 'Switch to Circle View';
    }

    // Re-render current visualization if a chord is selected
    if (qualitySelect.value) {
        updateChordDisplay();
    }
});

document.getElementById('toggleNotesDisplay').addEventListener('click', function() {
	window.showOnlyChordTones = !window.showOnlyChordTones;
	this.textContent = 'Toggle note visibility';

	// Re-render current visualization
	if (qualitySelect.value) {
		const root = rootSelect.value;
		const quality = qualitySelect.value;
		const chord = transposeChord(root, quality, chordData);

		// Update both visualizations
		document.getElementById('chordCircle').innerHTML = createChordCircle(root, chord.intervals, chord);
		createChromaticGrid(root, chord);
	}
});

// Set default state
window.showOnlyChordTones = true;  // Circle defaults to chord tones only
window.useSecondPosition = false;


// Handle position toggle
document.getElementById('togglePosition').addEventListener('click', function() {
    window.useSecondPosition = !window.useSecondPosition;
    this.textContent = window.useSecondPosition ? 
        'Switch to First Position' : 
        'Switch to Second Position';

    // Update grid if chord is selected
    if (qualitySelect.value) {
        const root = rootSelect.value;
        const quality = qualitySelect.value;
        const chord = transposeChord(root, quality, chordData);
        createChromaticGrid(root, chord, window.useSecondPosition);
    }
});
		

// 		document.getElementById('transpositions-checkbox').addEventListener('change', function() {
// 			document.getElementById('transposition-options').style.display = this.checked ? 'block' : 'none';
// 		});

