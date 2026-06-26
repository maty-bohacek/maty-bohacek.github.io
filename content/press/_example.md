---
# This file documents the format for press highlights and is NOT rendered
# (filenames starting with "_" are skipped by the loader).
#
# To add a press highlight, create a new file in this folder, e.g.
#   content/press/2025-03-10-wired-deepfakes.md
# with frontmatter like the block below, then write a one- or two-sentence
# description in the body. Entries are grouped and sorted by date automatically.
#
# Fields:
#   date      (required) ISO date, e.g. "2025-03-10". Controls ordering + year grouping.
#   title     (required) Headline shown for the highlight.
#   link      (optional) URL to the article / podcast / video / segment.
#   linkText  (optional) Label for the link (defaults to "Learn more"), e.g. "Read article", "Listen", "Watch".
#   image     (optional) Single image path, e.g. "/images/press/example.jpg".
#   images    (optional) List of image paths for a small gallery.
#   logo      (optional) Small square logo of the outlet, shown to the left of the
#             entry, e.g. "/images/press/logos/wired.png". Logos live in
#             public/images/press/logos/ (one PNG per outlet, reused across entries).
#   tags      (optional) List of tags, e.g. ["article", "podcast", "tv"].
#
# Title convention: titles are shown in English. For a non-English source, use the
# English (translated) headline and append a language tag at the end, e.g. " [CZ]",
# " [DE]", " [FR]". English-language sources get no tag.
date: "2025-01-01"
title: "Example: Featured in Example Magazine"
link: "https://example.com/article"
linkText: "Read article"
logo: "/images/press/logos/example.png"
tags: ["article"]
---

A one- or two-sentence description of the press mention goes here. This body text
is shown beneath the title, exactly like the Journal entries. The convention used
across entries is "Outlet · Type", e.g. "WIRED · Article" or "Radiožurnál · Radio".
