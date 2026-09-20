import Image from 'next/image';
import { ResearchInterest } from '@/types';

interface ResearchInterestsProps {
  interests: ResearchInterest[];
}

export default function ResearchInterests({ interests }: ResearchInterestsProps) {
  return (
    <div className="flex flex-col gap-3">
      {interests.map((interest) => (
        <article key={interest.id} className="research-interest">
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
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                {interest.body}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
