import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { EducatorService } from '../../educators/services/EducatorService';

interface PublicEducatorProfileViewProps {
  educatorUuid: string;
}

const PublicSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

function getSafeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

const PublicEducatorProfileView: React.FC<PublicEducatorProfileViewProps> = ({ educatorUuid }) => {
  const { t } = useLanguage();
  const profileQuery = useQuery({
    queryKey: ['public-educator-profile', educatorUuid],
    queryFn: () => EducatorService.getPublicProfile(educatorUuid),
    enabled: Boolean(educatorUuid),
    retry: false,
  });

  if (profileQuery.isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-900">
        <p className="mx-auto max-w-3xl text-center text-slate-500 dark:text-slate-300">{t('publicProfile.loading')}</p>
      </main>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-900">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('publicProfile.unavailable')}</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{t('publicProfile.unavailableMessage')}</p>
          <button onClick={() => profileQuery.refetch()} className="mt-5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-white">
            {t('publicProfile.retry')}
          </button>
        </div>
      </main>
    );
  }

  const profile = profileQuery.data;
  const socialLinks = profile.socialLinks
    .map((link) => ({ ...link, safeUrl: getSafeExternalUrl(link.url) }))
    .filter((link) => link.safeUrl);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-900 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-start">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-brand-primary/20"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">{t('publicProfile.label')}</p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{profile.name}</h1>
              {profile.headline && <p className="mt-1 font-semibold text-slate-600 dark:text-slate-300">{profile.headline}</p>}
              {profile.bioTitle && <h2 className="mt-4 font-bold text-slate-800 dark:text-slate-100">{profile.bioTitle}</h2>}
              {profile.bio && <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">{profile.bio}</p>}
            </div>
          </div>
        </div>

        {(profile.email || profile.phone || profile.identityNumber || profile.nationality || profile.gender || profile.country || profile.city) && (
          <PublicSection title={t('publicProfile.contactInfo')}>
            {profile.email && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold">{t('profile.email')}: </span>
                <a className="text-brand-primary hover:underline" href={`mailto:${profile.email}`}>{profile.email}</a>
              </p>
            )}
            {profile.phone && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold">{t('profile.phone')}: </span>
                <a className="text-brand-primary hover:underline" href={`tel:${profile.phone}`}>{profile.phone}</a>
              </p>
            )}
            {profile.identityNumber && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold">{t('profile.idNumber')}: </span>
                {profile.identityType ? `${t(`idType.${profile.identityType.toUpperCase()}`)} · ` : ''}
                {profile.identityNumber}
              </p>
            )}
            {profile.nationality && <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold">{t('profile.nationality')}: </span>{profile.nationality}</p>}
            {profile.gender && <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold">{t('profile.gender')}: </span>{t(`gender.${profile.gender.toUpperCase()}`)}</p>}
            {profile.country && <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold">{t('profile.country')}: </span>{profile.country}</p>}
            {profile.city && <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold">{t('profile.city')}: </span>{profile.city}</p>}
          </PublicSection>
        )}

        {profile.experienceLevel && (
          <PublicSection title={t('publicProfile.experienceLevel')}>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t(`experienceLevel.${profile.experienceLevel.toUpperCase()}`)}
              {typeof profile.experienceYears === 'number' ? ` · ${t('publicProfile.experienceYears', { count: profile.experienceYears })}` : ''}
            </p>
          </PublicSection>
        )}

        {(Boolean(profile.educationLevel) || profile.academicMajors.length > 0 || profile.certifications.length > 0) && (
          <PublicSection title={t('publicProfile.education')}>
            {profile.educationLevel && <p className="text-sm text-slate-600 dark:text-slate-300">{profile.educationLevel}</p>}
            {profile.academicMajors.map((major, index) => (
              <article key={`${major.majorName}-${index}`} className="border-s-2 border-brand-primary/40 ps-3">
                <h3 className="font-semibold text-slate-800 dark:text-white">{major.majorName || major.degree}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {[major.degree, major.institution, major.graduationYear].filter(Boolean).join(' · ')}
                </p>
              </article>
            ))}
            {profile.certifications.map((certification, index) => (
              <article key={`${certification.title}-${index}`} className="border-s-2 border-brand-primary/40 ps-3">
                <h3 className="font-semibold text-slate-800 dark:text-white">{certification.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {[certification.organization, certification.issueDate].filter(Boolean).join(' · ')}
                </p>
                {certification.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{certification.description}</p>}
              </article>
            ))}
          </PublicSection>
        )}

        {profile.workExperience.length > 0 && (
          <PublicSection title={t('publicProfile.experience')}>
            {profile.workExperience.map((experience, index) => (
              <article key={`${experience.title}-${index}`} className="border-s-2 border-brand-primary/40 ps-3">
                <h3 className="font-semibold text-slate-800 dark:text-white">{experience.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {[experience.organization, experience.startDate, experience.endDate].filter(Boolean).join(' · ')}
                </p>
                {experience.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{experience.description}</p>}
              </article>
            ))}
          </PublicSection>
        )}

        {(profile.skills.length > 0 || profile.services.length > 0) && (
          <PublicSection title={t('publicProfile.skillsAndServices')}>
            {profile.skills.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('publicProfile.skills')}</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => skill.name && (
                    <span key={`${skill.name}-${index}`} className="rounded-full bg-brand-primary/10 px-3 py-1 text-sm text-slate-700 dark:text-slate-200">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.services.map((service, index) => (
              <article key={`${service.name}-${index}`} className="border-s-2 border-brand-primary/40 ps-3">
                <h3 className="font-semibold text-slate-800 dark:text-white">{service.name}</h3>
                {service.description && <p className="text-sm text-slate-600 dark:text-slate-300">{service.description}</p>}
              </article>
            ))}
          </PublicSection>
        )}

        {profile.achievements.length > 0 && (
          <PublicSection title={t('publicProfile.achievements')}>
            {profile.achievements.map((achievement, index) => (
              <article key={`${achievement.title}-${index}`} className="border-s-2 border-brand-primary/40 ps-3">
                <h3 className="font-semibold text-slate-800 dark:text-white">{achievement.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {[achievement.organization, achievement.issueDate].filter(Boolean).join(' · ')}
                </p>
                {achievement.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{achievement.description}</p>}
              </article>
            ))}
          </PublicSection>
        )}

        {socialLinks.length > 0 && (
          <PublicSection title={t('publicProfile.socialLinks')}>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link, index) => (
                <a
                  key={`${link.platform}-${index}`}
                  href={link.safeUrl ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/5 dark:border-slate-600"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </PublicSection>
        )}
      </div>
    </main>
  );
};

export default PublicEducatorProfileView;
