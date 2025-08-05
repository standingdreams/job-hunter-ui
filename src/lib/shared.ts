export enum JobSiteId {
  Indeed = 'indeed',
  LinkedIn = 'linkedin',
  ZipRecruiter = 'zip_recruiter',
  Bayt = 'bayt',
  Google = 'google',
  Glassdoor = 'glassdoor',
  Naukri = 'naukri',
  Bdjobs = 'bdjobs',
}

export interface JobSite {
  id: JobSiteId;
  name: string;
}

export const jobSites: JobSite[] = [
  { id: JobSiteId.Indeed, name: 'Indeed' },
  { id: JobSiteId.LinkedIn, name: 'LinkedIn' },
  { id: JobSiteId.ZipRecruiter, name: 'ZipRecruiter' },
  { id: JobSiteId.Bayt, name: 'Bayt' },
  { id: JobSiteId.Google, name: 'Google' },
  { id: JobSiteId.Glassdoor, name: 'Glassdoor' },
  { id: JobSiteId.Naukri, name: 'Naukri' },
  { id: JobSiteId.Bdjobs, name: 'Bdjobs' },
];

// Helper function to get site name from job site ID
export function getSiteName(siteId: string): string {
  const site = jobSites.find(
    (s) => s.id === (siteId.toLowerCase() as JobSiteId),
  );
  return site ? site.name : siteId.charAt(0).toUpperCase() + siteId.slice(1);
}

export const JOB_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'fulltime', label: 'Full-time' },
  { value: 'parttime', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
] as const;

export const DATE_POSTED_OPTIONS = [
  { value: '24', label: 'Past 24 hours' },
  { value: '72', label: 'Past 3 days' },
  { value: '168', label: 'Past week' },
  { value: '720', label: 'Past month' },
  { value: '8760', label: 'Past year' },
] as const;
