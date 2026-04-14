import sys
import json
import os
import argparse
import traceback

try:
    import stable_whisper as whisper
except ImportError:
    print("Error: stable-ts (stable_whisper) not found. Please run 'pip install stable-ts'")
    sys.exit(1)

def align_lyrics(
    audio_path, 
    lyrics_text, 
    output_path, 
    language='pt',
    use_isolation=False,
    word_level=True
):
    try:
        print(f"--- Alignment Task Initialized ---")
        print(f"Audio: {audio_path}")
        print(f"Target: {output_path}")

        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Source audio not found: {audio_path}")

        # Vocal Isolation Step (Placeholder Hook for Demucs)
        process_audio = audio_path
        if use_isolation:
            print("Vocal isolation requested (Checking Demucs)...")
            try:
                import demucs.separate
                # In a real setup, we would run separation here
                # print("Separate success!")
            except ImportError:
                print("Warning: Demucs not found. Skipping isolation fallback.")

        # Load Whisper Model
        print(f"Loading Whisper model (base)...")
        model = whisper.load_model('base')
        
        # Performance alignment
        print(f"Aligning with language: {language}...")
        result = model.align(process_audio, lyrics_text, language=language)
        
        # Structure the Timeline
        timeline = {
            "meta": {
                "version": "v2.0",
                "engine": "stable-ts"
            },
            "segments": []
        }
        
        import uuid
        for segment in result.segments:
            words = []
            if word_level:
                for word in segment.words:
                    words.append({
                        "text": word.word.strip(),
                        "startMs": int(word.start * 1000),
                        "endMs": int(word.end * 1000)
                    })
            
            timeline["segments"].append({
                "id": str(uuid.uuid4()),
                "text": segment.text.strip(),
                "startMs": int(segment.start * 1000),
                "endMs": int(segment.end * 1000),
                "words": words
            })

        # Atomic Save
        temp_out = output_path + ".tmp"
        with open(temp_out, 'w', encoding='utf-8') as f:
            json.dump(timeline, f, indent=2, ensure_ascii=False)
        
        if os.path.exists(output_path):
            os.remove(output_path)
        os.rename(temp_out, output_path)

        print(f"--- Alignment Completed Successfully ---")

    except Exception as e:
        print(f"--- ALIGNMENT FAILED ---")
        print(traceback.format_exc())
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Professional Lyric Aligner CLI")
    parser.add_argument("--audio", required=True, help="Input audio file path")
    parser.add_argument("--lyrics", required=True, help="Input lyrics text file path")
    parser.add_argument("--output", required=True, help="Output timeline.json path")
    parser.add_argument("--language", default="pt", help="Audio language code")
    parser.add_argument("--isolate", action="store_true", help="Enable vocal isolation")
    parser.add_argument("--wordlevel", action="store_true", default=True, help="Enable word-level timing")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.lyrics):
        print(f"Error: Lyrics file not found: {args.lyrics}")
        sys.exit(1)

    with open(args.lyrics, 'r', encoding='utf-8') as f:
        lyrics_content = f.read()

    align_lyrics(
        args.audio, 
        lyrics_content, 
        args.output, 
        language=args.language,
        use_isolation=args.isolate,
        word_level=args.wordlevel
    )
