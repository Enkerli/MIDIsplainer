import json

# Definitions for musical alphabet and interval mappings
musical_alphabet = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
chromatic_map = {
    'C': 0, 'C#': 1, 'Db': 1,
    'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'E#': 5, 'Fb': 4,
    'F': 5, 'F#': 6, 'Gb': 6,
    'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11, 'B#': 0, 'Cb': 11
}

interval_to_semitone = {
    "R": 0, 
    "2": 2, "♭2": 1, "♯2": 3, "𝄫2": 0, "𝄪2": 4,
    "3": 4, "♭3": 3, "♯3": 5, "𝄫3": 2, "𝄪3": 6,
    "4": 5, "♯4": 6, "𝄪4": 7, "♭5": 6, "𝄫5": 5,
    "5": 7, "♯5": 8, "𝄪5": 9, "♭6": 8, "𝄫6": 7,
    "6": 9, "♯6": 10, "𝄪6": 11, "♭7": 10, "𝄫7": 9,
    "7": 11, "♯7": 12, "𝄪7": 13,
    "9": 14, "♭9": 13, "♯9": 15, "𝄫9": 12, "𝄪9": 16,
    "11": 17, "♯11": 18, "𝄪11": 19, "𝄫11": 16,
    "13": 21, "♭13": 20, "♯13": 22, "𝄫13": 19, "𝄪13": 23
}

# Function to transpose intervals into notes
def transpose_chord(root, intervals):
    root_chromatic = chromatic_map[root]
    root_letter = root[0]

    notes = []
    for interval in intervals:
        semitone_offset = interval_to_semitone[interval]
        target_chromatic = (root_chromatic + semitone_offset) % 12

        # Find all notes matching the chromatic value
        possible_notes = [
            note for note, value in chromatic_map.items()
            if value == target_chromatic and note.startswith(musical_alphabet[
                (musical_alphabet.index(root_letter) + (semitone_offset // 2)) % 7
            ])
        ]
        notes.append(possible_notes[0] if possible_notes else None)

    return notes

# Function to calculate pitch classes, binary, and decimal
def calculate_pcs_binary_decimal(notes):
    pcs = sorted({chromatic_map[note] for note in notes if note})
    binary = ''.join('1' if i in pcs else '0' for i in range(12))
    decimal = int(binary, 2)
    return pcs, binary, decimal

# Transpose all chords to 12 keys
def generate_chord_dictionary(base_chord_dict):
    expanded_dict = {}
    for chord_name, chord_data in base_chord_dict.items():
        intervals = chord_data["intervals"]
        for root in chromatic_map.keys():
            if len(root) > 2:  # Skip enharmonic duplicates like "E#"
                continue

            notes = transpose_chord(root, intervals)
            pcs, binary, decimal = calculate_pcs_binary_decimal(notes)

            expanded_dict[f"{chord_name}_{root}"] = {
                "root": root,
                "intervals": intervals,
                "notes": notes,
                "pcs": pcs,
                "binary": binary,
                "decimal": decimal,
                "aliases": chord_data.get("aliases", []),
                "fullName": chord_data.get("fullName", ""),
                "forteNumber": chord_data.get("forteNumber", ""),
                "baseDecimal": chord_data.get("baseDecimal", ""),
            }
    return expanded_dict

# Main function to read input file, process transpositions, and write output file
def main(input_file, output_file):
    # Load the input chord dictionary
    with open(input_file, 'r') as file:
        base_chord_dict = json.load(file)

    # Generate the transposed chord dictionary
    transposed_dict = generate_chord_dictionary(base_chord_dict)

    # Write the transposed dictionary to the output file
    with open(output_file, 'w') as file:
        json.dump(transposed_dict, file, indent=4)

# Execute the script
input_file = "chord_dictionary.json"  # Replace with your input file path
output_file = "chord_dictionary_transposed.json"  # Replace with your desired output file path
main(input_file, output_file)