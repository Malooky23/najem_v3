import json
import sys # Import sys to handle potential errors more gracefully

# --- Configuration ---
input_filename = '/Users/malek/local_projects/najem_v3/src/lib/constants/countries.json' # The name of your input JSON file
output_filename = '/Users/malek/local_projects/najem_v3/src/lib/constants/filtered_countries.json' # The name for the output file
keys_to_keep = [
    "id",
    "name",
    "iso3",
    "iso2",
    "numeric_code",
    "phone_code",
    "emoji",
    "emojiU"
]
# --- End Configuration ---

def filter_json_data(input_file, output_file, keys):
    """
    Reads a JSON file, filters each object in the list to keep specific keys,
    and writes the result to a new JSON file.

    Args:
        input_file (str): Path to the input JSON file.
        output_file (str): Path to the output JSON file.
        keys (list): A list of strings representing the keys to retain.
    """
    try:
        # Read the input JSON file - use utf-8 encoding for broader compatibility
        with open(input_file, 'r', encoding='utf-8') as infile:
            data = json.load(infile)
        print(f"Successfully loaded '{input_file}'. Found {len(data)} items.")

    except FileNotFoundError:
        print(f"Error: Input file '{input_file}' not found.")
        sys.exit(1) # Exit script with an error code
    except json.JSONDecodeError as e:
        print(f"Error: Could not decode JSON from '{input_file}'.")
        print(f"Details: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred while reading the file: {e}")
        sys.exit(1)

    # Ensure the loaded data is a list
    if not isinstance(data, list):
        print(f"Error: Expected a JSON list in '{input_file}', but got {type(data)}.")
        sys.exit(1)

    filtered_data = []
    # Iterate through each object in the original list
    for item in data:
        # Create a new dictionary containing only the desired keys
        filtered_item = {}
        if isinstance(item, dict): # Process only if the item is a dictionary
            for key in keys:
                if key in item: # Check if the key exists in the original item
                    filtered_item[key] = item[key]
            filtered_data.append(filtered_item)
        else:
            print(f"Warning: Skipping item that is not a dictionary: {item}")


    # --- Using List Comprehension (more concise alternative) ---
    # filtered_data = [
    #     {key: item[key] for key in keys if key in item}
    #     for item in data if isinstance(item, dict) # Ensure item is a dict
    # ]
    # --- End List Comprehension Alternative ---

    try:
        # Write the filtered data to the output JSON file
        # Use indent for pretty printing and ensure_ascii=False to keep emojis as they are
        with open(output_file, 'w', encoding='utf-8') as outfile:
            json.dump(filtered_data, outfile, indent=2, ensure_ascii=False)
        print(f"Successfully filtered data and saved to '{output_file}'.")

    except Exception as e:
        print(f"An error occurred while writing the output file '{output_file}': {e}")
        sys.exit(1)

# --- Main execution block ---
if __name__ == "__main__":
    filter_json_data(input_filename, output_filename, keys_to_keep)