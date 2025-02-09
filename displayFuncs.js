const fifthsColors = {
		'F':  '#00FF00', 
		'C':  '#FFFF00', 
		'G':  '#FFC000', 
		'D':  '#FF8000', 
		'A':  '#FF0000', 
		'E':  '#FF00FF', 
		'B':  '#8000FF', 
		'F♯': '#0000FF', 
		'C♯': '#0080FF', 
		'G♯': '#00C0FF', 
		'D♯': '#00FFFF', 
		'A♯': '#40FFC0', 
		'B♭': '#40FFC0', 
		'E♭': '#00FFFF', 
		'A♭': '#00C0FF', 
		'D♭': '#0080FF', 
		'G♭': '#0000FF'  
	};

// Map for pitch class colors (including rare spellings and double accidentals)
const pitchClassColors = {
		'B♯': fifthsColors['C'],   // PC 0
		'E♯': fifthsColors['F'],   // PC 5
		'F♭': fifthsColors['E'],   // PC 4
		'C♭': fifthsColors['B'],   // PC 11
		// Double accidentals
		'C𝄪': fifthsColors['D'],   // PC 2
		'F𝄪': fifthsColors['G'],   // PC 7
		'G𝄪': fifthsColors['A'],   // PC 9
		'D𝄪': fifthsColors['E'],   // PC 4
		'A𝄪': fifthsColors['B'],   // PC 11
		'E𝄪': fifthsColors['F♯'],  // PC 6
		'B𝄪': fifthsColors['C♯'],  // PC 1
		'C𝄫': fifthsColors['B♭'],  // PC 10
		'F𝄫': fifthsColors['E♭'],  // PC 3
		'G𝄫': fifthsColors['F'],   // PC 5
		'D𝄫': fifthsColors['C'],   // PC 0
		'A𝄫': fifthsColors['G'],   // PC 7
		'E𝄫': fifthsColors['D'],   // PC 2
		'B𝄫': fifthsColors['A']    // PC 9
	};

function createEmptyGrid() {
	const gridContainer = document.getElementById('chromaticGrid');
	gridContainer.innerHTML = '';

	// Create 5x5 grid with just numbers
	for (let row = 4; row >= 0; row--) {
		for (let col = 0; col < 5; col++) {
			const cell = document.createElement('div');
			cell.className = 'grid-cell';
			
			const cellNum = row * 5 + col;
			
			const numLabel = document.createElement('span');
			numLabel.className = 'cell-number';
			numLabel.textContent = cellNum;
			cell.appendChild(numLabel);
			
			gridContainer.appendChild(cell);
		}
	}
}

// Create chromatic grid visualization
function createChromaticGrid(root, chord, useSecondPosition = false) {
  const gridContainer = document.getElementById('chromaticGrid');
  gridContainer.innerHTML = '';

  // Get the root's pitch class to use as reference point
  const rootPC = getPC(root);
  
  // Create mapping of semitone distances to chord information
  const intervalMapping = chord.notes.map((note, index) => {
    const pc = getPC(note);
    // Calculate semitones from root, ensuring positive value
    const semitones = (pc - rootPC + 12) % 12;
    return {
      semitones,
      note,
      interval: chord.intervals[index]
    };
  });

  // Position offset when using second position
  const positionOffset = useSecondPosition ? 2 : 0;

  // Create 5x5 grid
  for (let row = 4; row >= 0; row--) {  // Start from bottom row
    for (let col = 0; col < 5; col++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      
      // Calculate cell number (0-24)
      const cellNum = row * 5 + col;
      
      // Calculate semitones from root position (0 or 2)
      const semitones = ((cellNum - positionOffset + 24) % 12);
      
      // Add cell number in bottom right
      const numLabel = document.createElement('span');
      numLabel.textContent = cellNum;
      numLabel.className = 'cell-number';
      cell.appendChild(numLabel);

      // Find if this position contains a chord tone
      const chordTone = intervalMapping.find(interval => interval.semitones === semitones);
      if (chordTone) {
        cell.className += ' active';

        // Determine if this is an extension (9, 11, 13)
        const isExtension = ['9', '♭9', '♯9', '11', '♯11', '13', '♭13'].includes(chordTone.interval);

        // Always grey out cells 0-1 in second position, plus usual octave break logic
        const octaveBreak = useSecondPosition ? 14 : 12;
        const beforeRoot = useSecondPosition && cellNum < 2;
        const shouldGreyOut = beforeRoot || 
                            (isExtension && cellNum < octaveBreak) || 
                            (!isExtension && cellNum >= octaveBreak);

        const noteColor = fifthsColors[chordTone.note[0]] || '#666';
        cell.style.backgroundColor = shouldGreyOut ? '#f4f0ec' : noteColor;
        cell.style.color = shouldGreyOut ? '#000' : (isColorDark(noteColor) ? '#fff' : '#000');

        // Create container for note and interval display
        const noteDisplay = document.createElement('div');
        noteDisplay.className = 'note-display';

        // Add note name
        const noteName = document.createElement('div');
        noteName.className = 'note-name';
        noteName.textContent = chordTone.note;
        noteDisplay.appendChild(noteName);

        // Add interval name
        const intervalName = document.createElement('div');
        intervalName.className = 'interval-name';
        intervalName.textContent = `(${chordTone.interval})`;
        noteDisplay.appendChild(intervalName);

        cell.insertBefore(noteDisplay, numLabel);
      }

      gridContainer.appendChild(cell);
    }
  }
}

// Define createChordCircle before it's used
function createChordCircle(root, intervals, chord) {
	// Circle of fifths colors with gradual contrast that wraps around
	const fifthsColors = {
		'F':  '#00FF00', 
		'C':  '#FFFF00', 
		'G':  '#FFC000', 
		'D':  '#FF8000', 
		'A':  '#FF0000', 
		'E':  '#FF00FF', 
		'B':  '#8000FF', 
		'F♯': '#0000FF', 
		'C♯': '#0080FF', 
		'G♯': '#00C0FF', 
		'D♯': '#00FFFF', 
		'A♯': '#40FFC0', 
		'B♭': '#40FFC0', 
		'E♭': '#00FFFF', 
		'A♭': '#00C0FF', 
		'D♭': '#0080FF', 
		'G♭': '#0000FF'  
	};

	// Map for pitch class colors (including rare spellings and double accidentals)
	const pitchClassColors = {
		'B♯': fifthsColors['C'],   // PC 0
		'E♯': fifthsColors['F'],   // PC 5
		'F♭': fifthsColors['E'],   // PC 4
		'C♭': fifthsColors['B'],   // PC 11
		// Double accidentals
		'C𝄪': fifthsColors['D'],   // PC 2
		'F𝄪': fifthsColors['G'],   // PC 7
		'G𝄪': fifthsColors['A'],   // PC 9
		'D𝄪': fifthsColors['E'],   // PC 4
		'A𝄪': fifthsColors['B'],   // PC 11
		'E𝄪': fifthsColors['F♯'],  // PC 6
		'B𝄪': fifthsColors['C♯'],  // PC 1
		'C𝄫': fifthsColors['B♭'],  // PC 10
		'F𝄫': fifthsColors['E♭'],  // PC 3
		'G𝄫': fifthsColors['F'],   // PC 5
		'D𝄫': fifthsColors['C'],   // PC 0
		'A𝄫': fifthsColors['G'],   // PC 7
		'E𝄫': fifthsColors['D'],   // PC 2
		'B𝄫': fifthsColors['A']    // PC 9
	};

	const radius = 100;
	const centerX = 150;
	const centerY = 150;
	const noteRadius = 12;
	const minRadius = -90; // Inner limit, close to center
	const maxRadius = -10; // Outer limit, close to chromatic circle
	
	// Add this alongside the other constants and mappings at the top of the script
	const intervalRadialPosition = {
		'R': 0,      // Root at innermost position
		'2': 0.1, '♭2': 0.05, '♯2': 0.15,
		'3': 0.2, '♭3': 0.15,
		'4': 0.25, '♯4': 0.3,
		'5': 0.35, '♭5': 0.3, '♯5': 0.4,
		'6': 0.45, '♭6': 0.4,
		'7': 0.55, '♭7': 0.5, '𝄫7': 0.45,
		'9': 0.65, '♭9': 0.6, '♯9': 0.7,
		'11': 0.8, '♯11': 0.85,
		'13': 0.95, '♭13': 0.9
	};

	// Get the notes in the chord for highlighting early
	const chordNotes = new Set(chord.notes);

	// All possible spellings at each chromatic position
	const allSpellings = [
		['C'],                // 0 (add B♯ only if in chord)
		['C♯', 'D♭'],        // 1
		['D'],                // 2
		['D♯', 'E♭'],        // 3
		['E'],                // 4 (add F♭ only if in chord)
		['F'],                // 5 (add E♯ only if in chord)
		['F♯', 'G♭'],        // 6
		['G'],                // 7
		['G♯', 'A♭'],        // 8
		['A'],                // 9
		['A♯', 'B♭'],        // 10
		['B']                 // 11 (add C♭ only if in chord)
	];

	// Add rare spellings if they're in the chord
	if (chordNotes.has('B♯')) allSpellings[0].push('B♯');
	if (chordNotes.has('F♭')) allSpellings[4].push('F♭');
	if (chordNotes.has('E♯')) allSpellings[5].push('E♯');
	if (chordNotes.has('C♭')) allSpellings[11].push('C♭');

	// Double sharp spellings
	if (chordNotes.has('C𝄪')) allSpellings[2].push('C𝄪');
	if (chordNotes.has('F𝄪')) allSpellings[7].push('F𝄪');
	if (chordNotes.has('G𝄪')) allSpellings[9].push('G𝄪');
	if (chordNotes.has('D𝄪')) allSpellings[4].push('D𝄪');
	if (chordNotes.has('A𝄪')) allSpellings[11].push('A𝄪');
	if (chordNotes.has('E𝄪')) allSpellings[6].push('E𝄪');
	if (chordNotes.has('B𝄪')) allSpellings[1].push('B𝄪');

	// Double flat spellings
	if (chordNotes.has('C𝄫')) allSpellings[10].push('C𝄫');
	if (chordNotes.has('F𝄫')) allSpellings[3].push('F𝄫');
	if (chordNotes.has('G𝄫')) allSpellings[5].push('G𝄫');
	if (chordNotes.has('D𝄫')) allSpellings[0].push('D𝄫');
	if (chordNotes.has('A𝄫')) allSpellings[7].push('A𝄫');
	if (chordNotes.has('E𝄫')) allSpellings[2].push('E𝄫');
	if (chordNotes.has('B𝄫')) allSpellings[9].push('B𝄫');
	



	function isColorDark(hexcolor) {
		const r = parseInt(hexcolor.slice(1,3), 16);
		const g = parseInt(hexcolor.slice(3,5), 16);
		const b = parseInt(hexcolor.slice(5,7), 16);
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		return brightness < 128;
	}
	
	function getRootPosition(note) {
		const positions = {
			'C': 0, 'C♯': 1, 'D♭': 1, 'D': 2, 'D♯': 3, 'E♭': 3,
			'E': 4, 'F': 5, 'F♯': 6, 'G♭': 6, 'G': 7, 'G♯': 8,
			'A♭': 8, 'A': 9, 'A♯': 10, 'B♭': 10, 'B': 11, 'C♭': 11
		};
		return positions[note] || 0;
	}

	function getNotePosition(hour, radiusOffset = 0) {
		const angle = (hour * 30 - 90) * (Math.PI / 180); // Start at C (top)
		return {
			x: centerX + (radius + radiusOffset) * Math.cos(angle),
			y: centerY + (radius + radiusOffset) * Math.sin(angle)
		};
	}

	// Calculate interval node positions and mapping to actual notes
	const intervalNodes = intervals.map((interval, index) => {
		// Get chromatic position relative to root
		let position = (intervalToPosition[interval] + getRootPosition(root)) % 12;

		// Calculate radius based on interval type
		const radialPos = intervalRadialPosition[interval] || 0;
		const radiusOffset = minRadius + (maxRadius - minRadius) * radialPos;

		return {
			...getNotePosition(position, radiusOffset),
			interval,
			note: chord.notes[index]  // Get the actual note for this interval
		};
	});

	// Generate SVG content
	let svg = `
		<svg viewBox="0 0 300 300" style="width: 100%; max-width: 400px; margin: 0 auto;">
			<!-- Reference lines -->
			${allSpellings.map((_, i) => {
				const angle = (i * 30 - 90) * (Math.PI / 180);
				const x2 = centerX + radius * Math.cos(angle);
				const y2 = centerY + radius * Math.sin(angle);
				return `
					<line 
						x1="${centerX}" 
						y1="${centerY}" 
						x2="${x2}" 
						y2="${y2}"
						stroke="#eee" 
						stroke-width="1" 
						stroke-dasharray="2,2"
					/>
				`;
			}).join('')}

			<!-- Main circle -->
			<circle 
				cx="${centerX}" 
				cy="${centerY}" 
				r="${radius}"
				fill="none" 
				stroke="#ddd" 
				stroke-width="1"
			/>
	`;

	// Add all possible note spellings
	allSpellings.forEach((spellings, i) => {
		// Sort spellings to create the right layering order
		const sortedSpellings = [...spellings].sort((a, b) => {
			const aIsChordTone = chordNotes.has(a);
			const bIsChordTone = chordNotes.has(b);

			// If both are chord tones or both are not, sort sharp before flat
			if (aIsChordTone === bIsChordTone) {
				return a.includes('♭') ? -1 : 1;  // Flats drawn first
			}

			// Otherwise, chord tones on top
			return aIsChordTone ? 1 : -1;
		});

		sortedSpellings.forEach((note, spellIndex) => {
			const isChordTone = chordNotes.has(note);

			// Skip if we're only showing chord tones and this isn't one
			if (window.showOnlyChordTones && !isChordTone) {
				return;
			}

			const labelOffset = 20;
			// Offset position slightly if there are multiple spellings
			const xOffset = sortedSpellings.length > 1 ? (spellIndex === 0 ? -8 : 8) : 0;
			const basePos = getNotePosition(i, labelOffset);
			const labelPos = {
				x: basePos.x + xOffset,
				y: basePos.y
			};

			const noteColor = fifthsColors[note] || pitchClassColors[note] || '#666';
			const textColor = isColorDark(noteColor) ? '#fff' : '#000';

			svg += `
				<g>
					<circle
						cx="${labelPos.x}"
						cy="${labelPos.y}"
						r="${noteRadius}"
						fill="${noteColor}"
						stroke="${isChordTone ? '#000' : 'none'}"
						stroke-width="${isChordTone ? '3' : '0'}"
						opacity="0.8"
					/>
					<text
						x="${labelPos.x}"
						y="${labelPos.y}"
						text-anchor="middle"
						alignment-baseline="middle"
						font-size="12"
						fill="${textColor}"
					>${note}</text>
				</g>
			`;
		});
	});

	// Add lines connecting interval nodes
	for (let i = 0; i < intervalNodes.length - 1; i++) {
		const current = intervalNodes[i];
		const next = intervalNodes[i + 1];
		svg += `
			<line
				x1="${current.x}"
				y1="${current.y}"
				x2="${next.x}"
				y2="${next.y}"
				stroke="#666"
				stroke-width="2"
			/>
		`;
	}

	// Add interval nodes
	intervalNodes.forEach((node, i) => {
		const noteColor = fifthsColors[node.note] || pitchClassColors[node.note] || '#666';
		const textColor = isColorDark(noteColor) ? '#fff' : '#000';

		svg += `
			<g>
				<circle
					cx="${node.x}"
					cy="${node.y}"
					r="${noteRadius}"
					fill="${noteColor}"
					stroke="#333"
					stroke-width="2"
				/>
				<text
					x="${node.x}"
					y="${node.y}"
					text-anchor="middle"
					alignment-baseline="middle"
					font-size="12"
					fill="${textColor}"
					font-weight="bold"
				>${node.interval}</text>
			</g>
		`;
	});

	svg += '</svg>';
	return svg;
}

 // Function to determine if a color is dark (for text contrast)
function isColorDark(hexcolor) {
	const r = parseInt(hexcolor.slice(1,3), 16);
	const g = parseInt(hexcolor.slice(3,5), 16);
	const b = parseInt(hexcolor.slice(5,7), 16);
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;
	return brightness < 128;
}


