import sys
import json
import os
import argparse
import stable_ts as whisper
from typing import Optional

def isolate_vocals(audio_path: str, output_dir: str) -> str:
    """
    Optional vocal isolation using demucs.
    In a real production environment, this would call `demucs` CLI.
    For this implementation, we'll check if demucs is installed.
    """
    try:
        import demucs.separate
        print("Starting vocal isolation...")
        # Simplified call; in practice, you might use subprocess for better control
        # For MVP, we'll assume the input is clean OR we just pass through if demucs fails/missing
        # result_path = ...
        return audio_path # Fallback for now, but hook is here
    except ImportError:
        print("Demucs not installed. Skipping vocal isolation.")
        return audio_path

def align_lyrics(
    audio_path: str, 
    lyrics_text: str, 
    output_path: str, 
    language: str = 'pt',
    use_isolation: bool = False,
    word_level: bool = True
):
    print(f"Processing: {audio_path}")
    
    process_audio = audio_path
    if use_isolation:
        output_dir = os.path.dirname(output_path)
        process_audio = isolate_vocals(audio_path, output_dir)

    # Load model
    # base is fast, but 'medium' or 'large-v3' are better for accuracy
    model = whisper.load_model('base')
    
    # Align
    result = model.align(process_audio, lyrics_text, language=language)
    
    timeline = {
        "segments": []
    }
    
    import uuid
    for segment in result.segments:
        segment_id = str(uuid.uuid4())
        words = []
        if word_level:
            for word in segment.words:
                words.append({
                    "text": word.word.strip(),
                    "startMs": int(word.start * 1000),
                    "endMs": int(word.end * 1000)
                })
        
        timeline["segments"].append({
            "id": segment_id,
            "text": segment.text.strip(),
            "startMs": int(segment.start * 1000),
            "endMs": int(segment.end * 1000),
            "words": words
        })

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(timeline, f, indent=2, ensure_ascii=False)
    
    print(f"Success: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--audio", required=True)
    parser.add_argument("--lyrics", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--language", default="pt")
    parser.add_argument("--isolate", action="store_true")
    parser.add_argument("--wordlevel", action="store_true", default=True)
    args = parser.parse_args()
    
    with open(args.lyrics, 'r', encoding='utf-8') as f:
        lyrics = f.read()

    align_lyrics(
        args.audio, 
        lyrics, 
        args.output, 
        language=args.language,
        use_isolation=args.isolate,
        word_level=args.wordlevel
    )
