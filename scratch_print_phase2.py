import os
import sys
import pickle
import random
import json

print("=== PHASE 2 EVIDENCE REPORT GENERATION ===")

with open("vector_db/metadata.pkl", "rb") as f:
    db = pickle.load(f)

chunks = db["chunks"]
metadatas = db["metadatas"]

total_chunks = len(chunks)
char_lens = [len(c) for c in chunks]
token_lens = [len(c) // 4 for c in chunks]

min_char = min(char_lens)
avg_char = sum(char_lens) / len(char_lens)
max_char = max(char_lens)

min_token = min(token_lens)
avg_token = sum(token_lens) / len(token_lens)
max_token = max(token_lens)

# Programmatic check for mid-sentence cuts:
valid_sentence_endings = ('.', '!', '?', ':', ')', '"', "'", '`', '|', '-', '}')
mid_sentence_cuts = 0
for c in chunks:
    c_clean = c.strip()
    if not c_clean.endswith(valid_sentence_endings):
        mid_sentence_cuts += 1

mid_sentence_pct = (mid_sentence_cuts / total_chunks) * 100.0

top_k = 4
top_k_tokens = top_k * avg_token
budget = 1800
fits_budget = top_k_tokens <= budget

print("\n" + "="*75)
print("             PHASE 2 CHUNKING EVIDENCE REPORT")
print("="*75)
print(f"Total FAISS Chunks   : {total_chunks}")
print(f"Chunk Length Chars   : Min={min_char}, Avg={avg_char:.1f}, Max={max_char}")
print(f"Chunk Length Tokens  : Min={min_token}, Avg={avg_token:.1f}, Max={max_token}")
print(f"Mid-Sentence Cut %   : {mid_sentence_cuts} / {total_chunks} ({mid_sentence_pct:.2f}%)")
print(f"Top-4 x Avg Tokens   : {top_k_tokens:.1f} tokens vs {budget} budget -> Fits? {fits_budget}")

print("\n" + "="*75)
print("                     10 RANDOM CHUNKS IN FULL")
print("="*75)

random.seed(42)
sample_indices = random.sample(range(total_chunks), 10)

samples_data = []

for idx_i, idx in enumerate(sample_indices, 1):
    m = metadatas[idx]
    c_text = chunks[idx]
    
    # Safe printing for Windows CP1252 stdout
    safe_text = c_text.encode(sys.stdout.encoding, errors='replace').decode(sys.stdout.encoding)
    
    print(f"\n--- SAMPLE CHUNK #{idx_i} [File: {m['source_file']} | Index: {m['chunk_index']} | Length: {len(c_text)} chars] ---")
    print(safe_text)
    print("-" * 75)
    
    samples_data.append({
        "sample_num": idx_i,
        "source_file": m['source_file'],
        "chunk_index": m['chunk_index'],
        "char_len": len(c_text),
        "text": c_text
    })

evidence = {
    "total_chunks": total_chunks,
    "min_char": min_char,
    "avg_char": avg_char,
    "max_char": max_char,
    "min_token": min_token,
    "avg_token": avg_token,
    "max_token": max_token,
    "mid_sentence_cuts": mid_sentence_cuts,
    "mid_sentence_pct": mid_sentence_pct,
    "top_k_tokens": top_k_tokens,
    "fits_budget": fits_budget,
    "samples": samples_data
}

with open("phase2_evidence_summary.json", "w", encoding="utf-8") as f:
    json.dump(evidence, f, indent=2, ensure_ascii=False)

print("\nSaved Phase 2 evidence to phase2_evidence_summary.json")
