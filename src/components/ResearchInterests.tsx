import Image from 'next/image';
import Link from 'next/link';
import { ResearchInterest } from '@/types';
import { ArrowUpRightIcon } from '@/components/Icons';

interface ResearchInterestItem extends Omit<ResearchInterest, 'body'> {
  bodyHtml: string;
}

// Same look as the links in the hero (Scholar, GitHub, ...).
const linkClass =
  'inline-flex items-center gap-1 text-sm font-ui font-medium text-neutral-800 hover:text-neutral-950 hover:underline underline-offset-4 transition-colors';

interface ResearchInterestsProps {
  interests: ResearchInterestItem[];
}

export default function ResearchInterests({ interests }: ResearchInterestsProps) {
  return (
    <div className="flex flex-col gap-3">
      {interests.map((interest) => (
        <article key={interest.id} className="panel">
          <div className="flex items-start gap-4 p-6">
            {interest.icon && (
              <div className="flex-shrink-0 relative w-12 h-12 sm:w-14 sm:h-14">
                <Image
                  src={interest.icon}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="research-interest-title">{interest.title}</h3>
              <p className="mt-2 text-[15px] text-neutral-700 leading-relaxed">
                {interest.summary}
              </p>
              <div
                className="mt-2 text-[15px] text-neutral-500 leading-relaxed [&_p]:m-0 [&_a]:text-primary-600 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary-700"
                dangerouslySetInnerHTML={{ __html: interest.bodyHtml }}
              />

              {/* Both land on a list already filtered to this interest */}
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
                <Link href={`/research/?interest=${interest.id}`} className={linkClass}>
                  See papers
                  <ArrowUpRightIcon className="w-3 h-3" />
                </Link>
                <Link href={`/blog/?interest=${interest.id}`} className={linkClass}>
                  See blog posts
                  <ArrowUpRightIcon className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
