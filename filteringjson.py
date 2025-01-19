import json

# Load the JSON file
file_path = "chord_dictionary_compact.json"
with open(file_path, "r") as file:
    data = json.load(file)

# Define the keys to keep
keys_to_keep = {"pcs", "notes", "aliases", "fullName", "decimal", "intervals"}

# Filter the JSON data
filtered_data = {
    chord: {key: value for key, value in details.items() if key in keys_to_keep}
    for chord, details in data.items()
}

# Save the filtered JSON to a new file
filtered_file_path = "chord_dictionary_filtered.json"
with open(filtered_file_path, "w") as filtered_file:
    json.dump(filtered_data, filtered_file, indent=2)

filtered_file_path
