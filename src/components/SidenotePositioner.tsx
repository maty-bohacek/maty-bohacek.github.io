'use client';

import { useEffect, useRef } from 'react';

interface Sidenote {
  id: string;
  text: string;
}

interface SidenotePositionerProps {
  footnotes: Sidenote[];
  citations: Sidenote[];
  children: React.ReactNode;
}

export default function SidenotePositioner({
  footnotes,
  citations,
  children,
}: SidenotePositionerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const positionSidenotes = () => {
      const container = containerRef.current;
      if (!container) return;

      const contentEl = container.querySelector('.blog-content');
      if (!contentEl) return;

      const contentRect = contentEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Position footnotes (left side)
      const footnoteRefs = contentEl.querySelectorAll('.footnote-ref');
      const footnotesColumn = container.querySelector('.blog-footnotes');

      if (footnotesColumn) {
        const footnoteNotes = footnotesColumn.querySelectorAll('.sidenote');
        const usedPositions: number[] = [];

        footnoteRefs.forEach((ref, index) => {
          const refRect = ref.getBoundingClientRect();
          const sidenote = footnoteNotes[index] as HTMLElement;

          if (sidenote) {
            // Calculate position relative to container
            let targetTop = refRect.top - containerRect.top;

            // Adjust for sidenote height to center it with the reference
            const sidenoteHeight = sidenote.offsetHeight;
            targetTop -= sidenoteHeight / 4;

            // Collision detection: ensure sidenotes don't overlap
            const minGap = 8; // minimum gap between sidenotes
            for (const usedPos of usedPositions) {
              if (targetTop < usedPos + sidenoteHeight + minGap && targetTop > usedPos - sidenoteHeight - minGap) {
                targetTop = usedPos + sidenoteHeight + minGap;
              }
            }

            usedPositions.push(targetTop);
            sidenote.style.position = 'absolute';
            sidenote.style.top = `${targetTop}px`;
            sidenote.style.right = '0';
            sidenote.style.width = '100%';
          }
        });
      }

      // Position citations (right side)
      const citationRefs = contentEl.querySelectorAll('.citation-ref');
      const citationsColumn = container.querySelector('.blog-citations');

      if (citationsColumn) {
        const citationNotes = citationsColumn.querySelectorAll('.sidenote');
        const usedPositions: number[] = [];

        citationRefs.forEach((ref) => {
          const refRect = ref.getBoundingClientRect();
          const citationId = ref.getAttribute('data-citation');

          // Find the matching sidenote by data-for attribute
          const sidenote = Array.from(citationNotes).find(
            (note) => note.getAttribute('data-for') === citationId
          ) as HTMLElement;

          if (sidenote && !sidenote.dataset.positioned) {
            // Calculate position relative to container
            let targetTop = refRect.top - containerRect.top;

            // Adjust for sidenote height to center it with the reference
            const sidenoteHeight = sidenote.offsetHeight;
            targetTop -= sidenoteHeight / 4;

            // Collision detection: ensure sidenotes don't overlap
            const minGap = 8;
            for (const usedPos of usedPositions) {
              if (targetTop < usedPos + sidenoteHeight + minGap && targetTop > usedPos - sidenoteHeight - minGap) {
                targetTop = usedPos + sidenoteHeight + minGap;
              }
            }

            usedPositions.push(targetTop);
            sidenote.style.position = 'absolute';
            sidenote.style.top = `${targetTop}px`;
            sidenote.style.left = '0';
            sidenote.style.width = '100%';
            sidenote.dataset.positioned = 'true';
          }
        });
      }
    };

    // Position on load and after fonts are ready
    positionSidenotes();

    // Re-position after fonts load (can affect layout)
    document.fonts?.ready.then(() => {
      positionSidenotes();
    });

    // Re-position on window resize
    window.addEventListener('resize', positionSidenotes);

    return () => {
      window.removeEventListener('resize', positionSidenotes);
    };
  }, [footnotes, citations]);

  return (
    <div ref={containerRef} className="blog-article-container">
      {/* Left margin: Footnotes */}
      <aside className="blog-sidenotes blog-footnotes">
        {footnotes.map((fn) => (
          <div key={fn.id} className="sidenote" data-for={fn.id}>
            <span className="sidenote-number">{fn.id}</span>
            <span className="sidenote-text">{fn.text}</span>
          </div>
        ))}
      </aside>

      {/* Main content */}
      {children}

      {/* Right margin: Citations */}
      <aside className="blog-sidenotes blog-citations">
        {citations.map((cit) => (
          <div key={cit.id} className="sidenote citation" data-for={cit.id}>
            <span className="sidenote-key">[{cit.id}]</span>
            <span className="sidenote-text">{cit.text}</span>
          </div>
        ))}
      </aside>
    </div>
  );
}
