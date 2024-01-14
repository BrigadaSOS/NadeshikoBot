import os
import json
import sys


def count_file_messages(json_file_path):
    # Open and read the JSON file
    with open(json_file_path, 'r') as file:
        # Load the JSON data
        data = json.load(file)

        message_acc = 0
        message_count = {}

        # Iterate over the items in the JSON data
        for message in data["messages"]:

            uid = message["author"]["id"]
            nick = message["author"]["nickname"]

            if uid not in message_count:
                message_count[uid] = {
                    "nickname": nick,
                    "count": 0
                }

            message_count[uid]["count"] += 1
            message_acc += 1

            print(f"[{message_acc}/{data['messageCount']}] {uid} - {nick}: {message_count[uid]['count']}")

        print(f"Processed {message_acc} out of {data['messageCount']} messages")
        print(json.dumps(message_count, indent=2))

        return message_count

def process_json_files_in_folder(folder_path, output_file_path):
    # Check if the specified path is a directory
    if not os.path.isdir(folder_path):
        print(f"Error: {folder_path} is not a directory.")
        return

    # List all files in the directory
    files = os.listdir(folder_path)

    # Filter files to include only those with a .json extension
    json_files = [file for file in files if file.endswith('.json')]

    total_messages_count = {}

    # Iterate over each JSON file and pretty print its contents
    for json_file in json_files:
        json_file_path = os.path.join(folder_path, json_file)
        print(f"\nProcessing {json_file}:\n")
        file_message_count = count_file_messages(json_file_path)

        for key, value in file_message_count.items():
            if key not in total_messages_count:
                total_messages_count[key] = file_message_count[key]
            else:
                total_messages_count[key]["count"] += file_message_count[key]["count"]

        print("---- Current sum of files ----")
        print(json.dumps(total_messages_count, indent=2))

    with open(output_file_path, "w") as output_file:
        json.dump(total_messages_count, output_file, indent=2)

    print(f"DONE! Results written to {output_file_path}")
    print(json.dumps(total_messages_count, indent=2))


if __name__ == "__main__":
    # Check if the correct number of command line arguments is provided
    if len(sys.argv) != 3:
        print("Usage: python message_count.py <input_folder> <output_file_name.json>")
        sys.exit(1)

    # Get the folder path from the command line argument
    json_folder_path = sys.argv[1]
    output_file_path = sys.argv[2]

    # Run the code for each JSON file in the folder
    process_json_files_in_folder(json_folder_path, output_file_path)
