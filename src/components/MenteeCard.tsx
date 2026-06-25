import Link from 'next/link';
import Image from 'next/image';
import { Mentee } from '@/lib/mentees';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function MenteeCard({ mentee }: { mentee: Mentee }) {
  const { name, website, photo, blurb } = mentee;

  const avatar = photo ? (
    <Image
      src={photo}
      alt={name}
      width={112}
      height={112}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 font-ui font-semibold text-xl">
      {initials(name)}
    </div>
  );

  const isExternal = website?.startsWith('http');

  return (
    <article className="flex flex-col items-center text-center">
      {/* Avatar */}
      <div className="w-28 h-28 rounded-full overflow-hidden bg-neutral-100 ring-1 ring-neutral-200">
        {website ? (
          <Link
            href={website}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="block w-full h-full"
          >
            {avatar}
          </Link>
        ) : (
          avatar
        )}
      </div>

      {/* Name */}
      <h3 className="mt-4 font-bold text-neutral-900">
        {website ? (
          <Link
            href={website}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="hover:text-primary-600 transition-colors"
          >
            {name}
          </Link>
        ) : (
          name
        )}
      </h3>

      {/* Blurb with inline citations */}
      <p className="mt-2 text-sm text-neutral-600 leading-relaxed text-left">
        {blurb.map((segment, index) =>
          segment.type === 'text' ? (
            <span key={index}>{segment.value}</span>
          ) : segment.number !== null ? (
            <Link
              key={index}
              href={`#mentored-pub-${segment.number}`}
              className="text-primary-600 hover:text-primary-700 font-ui text-xs align-super"
            >
              [{segment.number}]
            </Link>
          ) : null
        )}
      </p>
    </article>
  );
}
