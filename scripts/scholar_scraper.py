#!/usr/bin/env python3
"""
Google Scholar Publication Scraper

This script scrapes publications from a Google Scholar profile and exports them
to a CSV file compatible with the website's publication system.

Usage:
    python scholar_scraper.py --scholar-id YOUR_SCHOLAR_ID --output ../data/publications.csv

Requirements:
    pip install scholarly pandas
"""

import argparse
import csv
import time
from typing import List, Dict, Optional
import sys

try:
    from scholarly import scholarly
except ImportError:
    print("Error: 'scholarly' package not installed.")
    print("Install it with: pip install scholarly")
    sys.exit(1)

try:
    import pandas as pd
except ImportError:
    pd = None
    print("Warning: 'pandas' not installed. Using basic CSV writer.")


def fetch_scholar_publications(scholar_id: str, max_publications: int = 100) -> List[Dict]:
    """
    Fetch publications from a Google Scholar profile.

    Args:
        scholar_id: The Google Scholar profile ID
        max_publications: Maximum number of publications to fetch

    Returns:
        List of publication dictionaries
    """
    print(f"Fetching publications for scholar ID: {scholar_id}")

    try:
        # Search for author by ID
        author = scholarly.search_author_id(scholar_id)
        author = scholarly.fill(author, sections=['publications'])
    except Exception as e:
        print(f"Error fetching author: {e}")
        return []

    publications = []

    for i, pub in enumerate(author.get('publications', [])):
        if i >= max_publications:
            break

        print(f"Processing publication {i + 1}: {pub.get('bib', {}).get('title', 'Unknown')[:50]}...")

        # Fill in publication details
        try:
            pub_filled = scholarly.fill(pub)
            time.sleep(1)  # Rate limiting
        except Exception as e:
            print(f"  Warning: Could not fetch details: {e}")
            pub_filled = pub

        bib = pub_filled.get('bib', {})

        publication = {
            'id': generate_id(bib.get('title', '')),
            'title': bib.get('title', ''),
            'authors': bib.get('author', ''),
            'venue': bib.get('venue', bib.get('journal', bib.get('booktitle', ''))),
            'year': bib.get('pub_year', ''),
            'abstract': bib.get('abstract', ''),
            'thumbnail': '',  # Would need to be added manually
            'paper_url': pub_filled.get('pub_url', ''),
            'project_url': '',
            'code_url': '',
            'data_url': '',
            'video_url': '',
            'slides_url': '',
            'featured': 'false',
            'tags': '',
        }

        publications.append(publication)

    return publications


def generate_id(title: str) -> str:
    """Generate a URL-friendly ID from a title."""
    # Remove special characters and convert to lowercase
    id_str = title.lower()
    id_str = ''.join(c if c.isalnum() or c == ' ' else '' for c in id_str)
    id_str = '-'.join(id_str.split())
    return id_str[:50]  # Limit length


def save_to_csv(publications: List[Dict], output_path: str) -> None:
    """
    Save publications to a CSV file.

    Args:
        publications: List of publication dictionaries
        output_path: Path to output CSV file
    """
    if not publications:
        print("No publications to save.")
        return

    fieldnames = [
        'id', 'title', 'authors', 'venue', 'year', 'abstract', 'thumbnail',
        'paper_url', 'project_url', 'code_url', 'data_url', 'video_url',
        'slides_url', 'featured', 'tags'
    ]

    if pd is not None:
        # Use pandas for better CSV handling
        df = pd.DataFrame(publications)
        df = df[fieldnames]  # Ensure column order
        df.to_csv(output_path, index=False, quoting=csv.QUOTE_ALL)
    else:
        # Fallback to basic CSV writer
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
            writer.writeheader()
            writer.writerows(publications)

    print(f"Saved {len(publications)} publications to {output_path}")


def merge_with_existing(
    new_pubs: List[Dict],
    existing_path: str
) -> List[Dict]:
    """
    Merge new publications with existing ones, preserving manual edits.

    New publications not in the existing file will be added.
    Existing publications will keep their manually edited fields.
    """
    try:
        if pd is not None:
            existing_df = pd.read_csv(existing_path)
            existing_pubs = existing_df.to_dict('records')
        else:
            with open(existing_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                existing_pubs = list(reader)
    except FileNotFoundError:
        print(f"No existing file found at {existing_path}. Creating new file.")
        return new_pubs

    # Create lookup by title (case-insensitive)
    existing_by_title = {
        pub['title'].lower(): pub for pub in existing_pubs
    }

    merged = []
    new_count = 0

    for new_pub in new_pubs:
        title_lower = new_pub['title'].lower()

        if title_lower in existing_by_title:
            # Keep existing entry (preserves manual edits)
            merged.append(existing_by_title[title_lower])
        else:
            # Add new publication
            merged.append(new_pub)
            new_count += 1

    print(f"Found {new_count} new publications.")
    return merged


def main():
    parser = argparse.ArgumentParser(
        description='Scrape publications from Google Scholar'
    )
    parser.add_argument(
        '--scholar-id',
        required=True,
        help='Google Scholar profile ID (found in profile URL)'
    )
    parser.add_argument(
        '--output',
        default='../data/publications.csv',
        help='Output CSV file path'
    )
    parser.add_argument(
        '--max-publications',
        type=int,
        default=100,
        help='Maximum number of publications to fetch'
    )
    parser.add_argument(
        '--merge',
        action='store_true',
        help='Merge with existing CSV file, preserving manual edits'
    )

    args = parser.parse_args()

    # Fetch publications
    publications = fetch_scholar_publications(
        args.scholar_id,
        args.max_publications
    )

    if not publications:
        print("No publications found or error occurred.")
        return

    # Optionally merge with existing
    if args.merge:
        publications = merge_with_existing(publications, args.output)

    # Save to CSV
    save_to_csv(publications, args.output)

    print("\nDone! Review the CSV file and:")
    print("1. Add thumbnail paths for publications")
    print("2. Set 'featured' to 'true' for highlight publications")
    print("3. Add tags separated by semicolons")
    print("4. Add project/code/video URLs as available")


if __name__ == '__main__':
    main()
