import json
import os
import math

def split_json_file(input_file, output_dir, chunk_size=1000):
    """Split a JSON file into smaller chunks"""
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Extract players array
    players = data.get('players', [])
    total_items = len(players)
    num_chunks = math.ceil(total_items / chunk_size)
    
    print(f"Splitting {input_file} into {num_chunks} chunks...")
    
    for i in range(num_chunks):
        start_idx = i * chunk_size
        end_idx = min((i + 1) * chunk_size, total_items)
        chunk_players = players[start_idx:end_idx]
        
        # Create chunk data with metadata
        chunk_data = {
            "metadata": data.get('metadata', {}),
            "players": chunk_players,
            "chunk_info": {
                "chunk_number": i + 1,
                "total_chunks": num_chunks,
                "start_index": start_idx,
                "end_index": end_idx,
                "total_players": len(chunk_players)
            }
        }
        
        # Create chunk filename
        base_name = os.path.splitext(os.path.basename(input_file))[0]
        chunk_filename = f"{base_name}_chunk_{i+1:03d}.json"
        chunk_path = os.path.join(output_dir, chunk_filename)
        
        # Save chunk
        with open(chunk_path, 'w', encoding='utf-8') as f:
            json.dump(chunk_data, f, indent=2, ensure_ascii=False)
        
        print(f"  Created {chunk_filename} with {len(chunk_players)} players")
    
    # Create metadata file
    metadata = {
        "original_file": input_file,
        "total_players": total_items,
        "chunk_size": chunk_size,
        "num_chunks": num_chunks,
        "chunks": [f"{base_name}_chunk_{i+1:03d}.json" for i in range(num_chunks)]
    }
    
    metadata_file = os.path.join(output_dir, f"{base_name}_metadata.json")
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"Created metadata file: {metadata_file}")

def main():
    # Split USL data
    split_json_file(
        "backend/pro/usl_league_one_players_api.json",
        "backend/pro/chunks/usl",
        chunk_size=100
    )
    
    # Split MLS data
    split_json_file(
        "backend/pro/mls_next_pro_players_api.json", 
        "backend/pro/chunks/mls",
        chunk_size=100
    )
    
    print("Data splitting complete!")

if __name__ == "__main__":
    main() 