#!/usr/bin/env python3
"""
Extract proxy metrics from a Cursor agent transcript and append to migration-log.csv.

Usage:
    python3 scripts/transcript-metrics.py <transcript-uuid> <template-name> [options]

Options:
    --tokens N          Manual token count from Cursor UI
    --notes "..."       Freeform notes
    --transcripts-dir   Override transcripts directory path
    --csv-path          Override CSV output path (default: metrics/migration-log.csv)
    --dry-run           Print metrics without appending to CSV
"""

import argparse
import csv
import json
import os
import sys
from datetime import date
from pathlib import Path


def find_transcript(transcript_id: str) -> Path | None:
    """Search all Cursor project directories for a transcript by UUID."""
    cursor_dir = Path.home() / ".cursor" / "projects"
    if not cursor_dir.exists():
        return None
    for project_dir in cursor_dir.iterdir():
        candidate = project_dir / "agent-transcripts" / transcript_id
        if candidate.exists():
            return candidate
    return None


def parse_jsonl(filepath: Path) -> dict:
    """Parse a .jsonl transcript file and return word/turn counts."""
    words = 0
    user_turns = 0
    assistant_turns = 0

    with open(filepath) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            role = obj.get("role", "")
            content = obj.get("message", {}).get("content", [])
            for block in content:
                text = block.get("text", "")
                words += len(text.split())
            if role == "user":
                user_turns += 1
            elif role == "assistant":
                assistant_turns += 1

    return {
        "words": words,
        "user_turns": user_turns,
        "assistant_turns": assistant_turns,
        "bytes": filepath.stat().st_size,
    }


def collect_metrics(transcript_dir: Path) -> dict:
    """Collect metrics from a transcript directory (main + subagents)."""
    main_file = transcript_dir / f"{transcript_dir.name}.jsonl"
    if not main_file.exists():
        print(f"Error: transcript file not found: {main_file}", file=sys.stderr)
        sys.exit(1)

    main = parse_jsonl(main_file)

    subagents_dir = transcript_dir / "subagents"
    subagent_count = 0
    subagent_words = 0
    subagent_bytes = 0

    if subagents_dir.exists():
        for sa_file in subagents_dir.glob("*.jsonl"):
            sa = parse_jsonl(sa_file)
            subagent_count += 1
            subagent_words += sa["words"]
            subagent_bytes += sa["bytes"]

    return {
        "total_words": main["words"] + subagent_words,
        "user_turns": main["user_turns"],
        "assistant_turns": main["assistant_turns"],
        "subagent_count": subagent_count,
        "subagent_words": subagent_words,
        "transcript_bytes": main["bytes"] + subagent_bytes,
    }


def main():
    parser = argparse.ArgumentParser(description="Extract migration metrics from agent transcripts")
    parser.add_argument("transcript_id", help="UUID of the main conversation transcript")
    parser.add_argument("template", help="Template name (e.g. astrowind)")
    parser.add_argument("--tokens", type=int, default=None, help="Manual token count from Cursor UI")
    parser.add_argument("--notes", default="", help="Freeform notes")
    parser.add_argument("--transcripts-dir", default=None, help="Override transcripts directory path")
    parser.add_argument("--csv-path", default=None, help="Override CSV output path")
    parser.add_argument("--dry-run", action="store_true", help="Print metrics without appending to CSV")
    args = parser.parse_args()

    if args.transcripts_dir:
        transcript_dir = Path(args.transcripts_dir) / args.transcript_id
    else:
        transcript_dir = find_transcript(args.transcript_id)

    if not transcript_dir or not transcript_dir.exists():
        print(f"Error: transcript not found for {args.transcript_id}. Use --transcripts-dir.", file=sys.stderr)
        sys.exit(1)

    metrics = collect_metrics(transcript_dir)

    row = {
        "date": date.today().isoformat(),
        "template": args.template,
        "transcript_id": args.transcript_id,
        "total_words": metrics["total_words"],
        "user_turns": metrics["user_turns"],
        "assistant_turns": metrics["assistant_turns"],
        "subagent_count": metrics["subagent_count"],
        "subagent_words": metrics["subagent_words"],
        "transcript_bytes": metrics["transcript_bytes"],
        "manual_token_count": args.tokens or "",
        "notes": args.notes,
    }

    print("\n  Migration Metrics")
    print("  " + "-" * 36)
    print(f"  Template:         {row['template']}")
    print(f"  Date:             {row['date']}")
    print(f"  Total words:      {row['total_words']:,}")
    print(f"  User turns:       {row['user_turns']}")
    print(f"  Assistant turns:  {row['assistant_turns']}")
    print(f"  Subagents:        {row['subagent_count']}")
    print(f"  Subagent words:   {row['subagent_words']:,}")
    print(f"  Transcript bytes: {row['transcript_bytes']:,}")
    if args.tokens:
        print(f"  Manual tokens:    {args.tokens:,}")
    print()

    if args.dry_run:
        print("  (dry run — not written to CSV)")
        return

    script_dir = Path(__file__).resolve().parent
    repo_root = script_dir.parent
    csv_path = Path(args.csv_path) if args.csv_path else repo_root / "metrics" / "migration-log.csv"

    if not csv_path.exists():
        print(f"Error: CSV file not found: {csv_path}", file=sys.stderr)
        sys.exit(1)

    fieldnames = [
        "date", "template", "transcript_id", "total_words", "user_turns",
        "assistant_turns", "subagent_count", "subagent_words",
        "transcript_bytes", "manual_token_count", "notes",
    ]

    with open(csv_path, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writerow(row)

    print(f"  Appended to {csv_path}")


if __name__ == "__main__":
    main()
