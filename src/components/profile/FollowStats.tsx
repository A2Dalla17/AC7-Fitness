'use client';

import { useCopy } from '@/context/LanguageContext';

export default function FollowStats({
  followers,
  following,
}: {
  userId?: string;
  followers: number;
  following: number;
}) {
  const copy = useCopy();

  return (
    <div className="profile-follow-stats">
      <div className="profile-follow-stats__item">
        <strong>{followers}</strong>
        <span>{copy.profile.followers}</span>
      </div>
      <div className="profile-follow-stats__item">
        <strong>{following}</strong>
        <span>{copy.profile.following}</span>
      </div>
    </div>
  );
}
