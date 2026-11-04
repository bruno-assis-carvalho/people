#!/bin/bash

# --- Configuration ---
PACKAGES_BASE_DIR="./apps"     # Base directory to scan for original .env files
ENV_FILE_EXTENSION=".env"          # File extension to target
ENCRYPTED_OUTPUT_DIR="./dev-config/env" # Directory to save encrypted files

# --- Functions ---

# Function to display usage information
usage() {
    echo "Usage: $0 [encrypt|decrypt] <password>"
    echo "  This script scans '$PACKAGES_BASE_DIR/*' for '$ENV_FILE_EXTENSION' files."
    echo "  encrypt: Encrypts all found '$ENV_FILE_EXTENSION' files."
    echo "           Encrypted files will be saved in '$ENCRYPTED_OUTPUT_DIR/'"
    echo "           with names like 'folder_name.env.enc'."
    echo "  decrypt: Decrypts all found '.env.enc' files from '$ENCRYPTED_OUTPUT_DIR/',"
    echo "           creating '.env' files in their original subfolders."
    exit 1
}

# Function to perform encryption for a single file
perform_encrypt() {
    local input_file="$1"
    local password="$2"

    # Extract the parent folder name from the input_file path
    # e.g., for "packages/some-folder/.env", this gets "some-folder"
    local folder_name=$(basename "$(dirname "$input_file")")

    # Construct the new encrypted file name in the specified output directory
    local encrypted_file="${ENCRYPTED_OUTPUT_DIR}/${folder_name}${ENV_FILE_EXTENSION}.enc"

    # Ensure the output directory exists
    mkdir -p "$ENCRYPTED_OUTPUT_DIR"

    echo "  Encrypting '$input_file' to '$encrypted_file'..."
    openssl enc -e -aes-256-cbc -a -in "$input_file" -out "$encrypted_file" -pass "pass:$password"
    if [ $? -eq 0 ]; then
        echo "  Encryption successful for '$input_file'."
    else
        echo "  Encryption failed for '$input_file'. Please check password or permissions."
        return 1
    fi
}

# Function to perform decryption for a single file
perform_decrypt() {
    local input_file="$1" # This will be the .env.enc file from ENCRYPTED_OUTPUT_DIR

    local password="$2"

    # Determine the original folder path for decryption
    # If input_file is "dev-config/env/my_app.env.enc", we need to derive "packages/my_app/.env"
    # First, get "my_app.env" from "my_app.env.enc"
    local base_name_with_env=$(basename "$input_file" .enc)
    # Then, get "my_app" from "my_app.env"
    local folder_name=$(basename "$base_name_with_env" "$ENV_FILE_EXTENSION")
    
    # Construct the original directory path
    local original_dir="${PACKAGES_BASE_DIR}/${folder_name}"
    
    # Construct the decrypted file path in its original subfolder
    local decrypted_file="${original_dir}/${ENV_FILE_EXTENSION}"

    # Ensure the original directory exists before attempting to write
    if [ ! -d "$original_dir" ]; then
        echo "  Warning: Original directory '$original_dir' not found for decryption. Creating it."
        mkdir -p "$original_dir"
    fi

    echo "  Decrypting '$input_file' to '$decrypted_file'..."
    openssl enc -d -aes-256-cbc -a -in "$input_file" -out "$decrypted_file" -pass "pass:$password"
    if [ $? -eq 0 ]; then
        echo "  Decryption successful for '$input_file'. Decrypted content in '$decrypted_file'"
    else
        echo "  Decryption failed for '$input_file'. Incorrect password or corrupted file."
        return 1
    fi
}

# --- Main Script Logic ---

# Check if at least two arguments are provided (command and password)
if [ "$#" -ne 2 ]; then
    usage
fi

COMMAND=$1
PASSWORD=$2

# Find target files based on command
TARGET_FILES=()
if [ "$COMMAND" = "encrypt" ]; then
    # Find .env files located within the first level of subdirectories under 'packages/'
    if [ ! -d "$PACKAGES_BASE_DIR" ]; then
        echo "Error: Base directory '$PACKAGES_BASE_DIR' not found. Cannot encrypt."
        exit 1
    fi
    while IFS= read -r -d $'\0' file; do
        TARGET_FILES+=("$file")
    done < <(find "$PACKAGES_BASE_DIR" -maxdepth 2 -type f -name "*$ENV_FILE_EXTENSION" -print0)
elif [ "$COMMAND" = "decrypt" ]; then
    # Find .env.enc files in the specified encrypted output directory
    if [ ! -d "$ENCRYPTED_OUTPUT_DIR" ]; then
        echo "Error: Encrypted output directory '$ENCRYPTED_OUTPUT_DIR' not found. Cannot decrypt."
        exit 1
    fi
    while IFS= read -r -d $'\0' file; do
        TARGET_FILES+=("$file")
    done < <(find "$ENCRYPTED_OUTPUT_DIR" -maxdepth 1 -type f -name "*${ENV_FILE_EXTENSION}.enc" -print0)
else
    echo "Invalid command: $COMMAND"
    usage
fi

if [ ${#TARGET_FILES[@]} -eq 0 ]; then
    echo "No relevant files found for '$COMMAND' operation."
    exit 0
fi

echo "--- Starting $COMMAND operation ---"

# Loop through found files and perform the action
for file_path in "${TARGET_FILES[@]}"; do
    if [ "$COMMAND" = "encrypt" ]; then
        perform_encrypt "$file_path" "$PASSWORD"
    elif [ "$COMMAND" = "decrypt" ]; then
        perform_decrypt "$file_path" "$PASSWORD"
    fi
done

echo "--- $COMMAND operation completed ---"
