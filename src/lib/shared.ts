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
