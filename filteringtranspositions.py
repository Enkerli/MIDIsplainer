# Adjust the script to handle cases where "transpositions" might not be present
updated_filtered_data = {
    chord: {
        key: (
            {k: v["decimal"] for k, v in details.get("transpositions", {}).items()} 
            if key == "transpositions" 
            else value
        )
        for key, value in details.items()
        if key in keys_to_keep or key == "transpositions"
    }
    for chord, details in data.items()
}

# Save the updated filtered JSON to a new file
updated_filtered_file_path = "/mnt/data/chord_dictionary_transpositions_filtered.json"
with open(updated_filtered_file_path, "w") as updated_filtered_file:
    json.dump(updated_filtered_data, updated_filtered_file, indent=2)

updated_filtered_file_path
