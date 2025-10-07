import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { BaseLayout } from '@/layouts/BaseLayout';
import {
  DATE_POSTED_OPTIONS,
  JOB_TYPES,
  getSiteName,
  jobSites,
} from '@/lib/shared';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  date_posted?: string;
  min_amount?: number;
  max_amount?: number;
  site: string;
}

const jobSearchSchema = z.object({
  searchQuery: z.string().optional(),
  jobType: z.string().optional(),
  location: z.string().optional(),
  hoursOld: z.string().optional(),
  currentPage: z.number().optional(),
  includeRemote: z.boolean().optional(),
  jobSites: z.array(z.string()).optional(),
});

export const Route = createFileRoute('/')({
  validateSearch: jobSearchSchema,
  component: JobSearchDashboard,
});

function JobSearchDashboard() {
  const {
    searchQuery,
    jobType,
    location,
    hoursOld,
    currentPage,
    includeRemote,
    jobSites: selectedJobSites,
  } = Route.useSearch();
  const navigate = Route.useNavigate();

  const searchQueryValue = searchQuery ?? '';
  const jobTypeValue = jobType ?? 'all';
  const locationValue = location ?? '';
  const hoursOldValue = hoursOld ?? '72';
  const currentPageValue = currentPage ?? 1;
  const includeRemoteValue = includeRemote !== false;
  const selectedJobSitesValue = selectedJobSites ?? [
    'indeed',
    'linkedin',
    'google',
  ];
  const jobsPerPage = 4;

  // Debounce search query and location to avoid excessive API calls
  const [debouncedSearchQuery] = useDebounce(searchQueryValue, 500);
  const [debouncedLocation] = useDebounce(locationValue, 500);
  const searchParams = useSearch({
    strict: false,
    structuralSharing: false,
  }) as Record<string, any>;

  const updateSearchParams = useCallback(
    (updates: Record<string, any>) => {
      const newParams = {
        ...searchParams,
        ...updates,
        currentPage:
          updates.currentPage !== undefined ? updates.currentPage : 1,
      };

      Object.keys(newParams).forEach((key) => {
        const value = (newParams as Record<string, any>)[key];
        if (value === '' || value === null || value === undefined) {
          delete (newParams as Record<string, any>)[key];
        }
      });

      navigate({
        to: '/',
        search: newParams,
        replace: true,
      });
    },
    [navigate, searchParams],
  );

  const setSearchQuery = useCallback(
    (value: string) => {
      updateSearchParams({ searchQuery: value });
    },
    [updateSearchParams],
  );

  const setJobType = useCallback(
    (value: string) => {
      updateSearchParams({ jobType: value });
    },
    [updateSearchParams],
  );

  const setLocation = useCallback(
    (value: string) => {
      updateSearchParams({ location: value });
    },
    [updateSearchParams],
  );

  const setHoursOld = useCallback(
    (value: string) => {
      updateSearchParams({ hoursOld: value });
    },
    [updateSearchParams],
  );

  const setIncludeRemote = useCallback(
    (value: boolean) => {
      updateSearchParams({ includeRemote: value });
    },
    [updateSearchParams],
  );

  const setJobSites = useCallback(
    (value: string[]) => {
      updateSearchParams({ jobSites: value.length > 0 ? value : undefined });
    },
    [updateSearchParams],
  );

  const clearAllFilters = useCallback(() => {
    navigate({
      to: '/',
      search: {},
      replace: true,
    });
  }, [navigate]);

  const setCurrentPage = (page: number) => {
    navigate({
      to: '/',
      search: (prev) => ({ ...prev, currentPage: page }),
      replace: true,
    });
  };

  // Function to fetch jobs from FastAPI endpoint
  const fetchJobs = async (queryParams: {
    searchQuery: string;
    jobType: string;
    location: string;
    hoursOld: string;
    includeRemote: boolean;
    jobSites: string[];
    offset: number;
  }) => {
    const params = new URLSearchParams({
      search_term:
        queryParams.searchQuery ||
        'software engineer (javascript OR typescript OR react OR nodejs OR express OR python OR postgresql OR mysql OR mongo OR redis)',
      is_remote: queryParams.includeRemote.toString(),
      location: queryParams.location,
      results_wanted: jobsPerPage.toString(),
      interval: 'yearly',
      country: 'USA',
      job_type: queryParams.jobType === 'all' ? '' : queryParams.jobType,
      hours_old: queryParams.hoursOld,
      offset: queryParams.offset.toString(),
    });

    // Add multiple site_name parameters
    queryParams.jobSites.forEach((site) => {
      params.append('site_name', site);
    });

    const response = await fetch(
      `http://127.0.0.1:8000/jobs?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch jobs: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.info('Fetched jobs data:', data);
    // Return both jobs and total count for pagination
    if (Array.isArray(data)) {
      return { jobs: data, total: data.length };
    } else {
      return {
        jobs: data.jobs ?? [],
        total: data.total ?? data.count ?? (data.jobs ? data.jobs.length : 0),
      };
    }
  };

  // Calculate offset for server-side pagination
  const offset = (currentPageValue - 1) * jobsPerPage;

  // Use Tanstack Query to fetch jobs
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'jobs',
      debouncedSearchQuery,
      jobTypeValue,
      debouncedLocation,
      hoursOldValue,
      includeRemoteValue,
      selectedJobSitesValue,
      currentPageValue,
    ],
    queryFn: () =>
      fetchJobs({
        searchQuery: debouncedSearchQuery,
        jobType: jobTypeValue,
        location: debouncedLocation,
        hoursOld: hoursOldValue,
        includeRemote: includeRemoteValue,
        jobSites: selectedJobSitesValue,
        offset,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const jobs = data?.jobs ?? [];
  const totalJobs = data?.total ?? 0;

  // Server-side pagination - no client-side filtering needed
  // The API returns already filtered and paginated results
  const totalPages = Math.ceil(totalJobs / jobsPerPage);
  const startIndex = (currentPageValue - 1) * jobsPerPage;
  const paginatedJobs = jobs; // Jobs are already paginated from server

  // Reset to page 1 when filters change (excluding page changes)
  const filterDeps = [
    debouncedSearchQuery,
    jobTypeValue,
    debouncedLocation,
    hoursOldValue,
    includeRemoteValue,
    selectedJobSitesValue,
  ];
  const prevFilterDepsRef = useRef(filterDeps);

  useEffect(() => {
    const prevFilterDeps = prevFilterDepsRef.current;
    const filtersChanged = filterDeps.some(
      (dep, index) => dep !== prevFilterDeps[index],
    );

    if (filtersChanged && currentPageValue !== 1) {
      setCurrentPage(1);
    }

    prevFilterDepsRef.current = filterDeps;
  }, filterDeps);

  // Scroll to top when page changes and data has loaded
  const prevPageRef = useRef(currentPageValue);

  useEffect(() => {
    const prevPage = prevPageRef.current;
    const pageChanged = currentPageValue !== prevPage;

    // Only scroll if page actually changed (not on initial load) and data is not loading
    if (pageChanged && prevPage !== currentPageValue && !isLoading) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }

    prevPageRef.current = currentPageValue;
  }, [currentPageValue, isLoading]);

  return (
    <BaseLayout>
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search jobs, companies, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={clearAllFilters}>
                Clear all filters
              </DropdownMenuItem>
              <DropdownMenuItem>Save current filters</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              {JOB_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-64">
            <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Location (e.g., Atlanta, GA)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={hoursOld} onValueChange={setHoursOld}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date Posted" />
            </SelectTrigger>
            <SelectContent>
              {DATE_POSTED_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="bg-background flex items-center space-x-2 rounded-md border px-3 py-2">
            <Checkbox
              id="include-remote"
              checked={includeRemote}
              onCheckedChange={(checked) => setIncludeRemote(checked === true)}
            />
            <label
              htmlFor="include-remote"
              className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Only Remote Jobs
            </label>
          </div>

          {/* Job Sites Multi-Select */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Job Sites ({selectedJobSitesValue.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {jobSites.map((site) => (
                <DropdownMenuItem
                  key={site.id}
                  onClick={(e) => {
                    e.preventDefault();
                    const isSelected = selectedJobSitesValue.includes(site.id);
                    if (isSelected) {
                      setJobSites(
                        selectedJobSitesValue.filter((id) => id !== site.id),
                      );
                    } else {
                      setJobSites([...selectedJobSitesValue, site.id]);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    checked={selectedJobSitesValue.includes(site.id)}
                    onChange={() => {}}
                  />
                  {site.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {isLoading
            ? 'Loading jobs...'
            : error
              ? ''
              : totalJobs > 0
                ? `Showing ${startIndex + 1}-${startIndex + jobs.length} of ${totalJobs} jobs`
                : 'No jobs found'}
        </p>
        {/* <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select defaultValue="relevance">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date Posted</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
      </div>

      {/* Job Listings */}
      <div className="grid gap-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: jobsPerPage }).map((_, index) => (
            <Card key={`skeleton-${index}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-3 h-4 w-2/3" />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-14" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          // Error state
          <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
              <div className="h-8 w-8 text-red-500">⚠️</div>
            </div>
            <h3 className="text-lg font-semibold">Error loading jobs</h3>
            <p className="text-muted-foreground">
              {error instanceof Error
                ? error.message
                : 'An unexpected error occurred while fetching jobs.'}
            </p>
            <Button
              className="max-w-52"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </Card>
        ) : paginatedJobs.length > 0 ? (
          // Job listings
          paginatedJobs.map((job: Job) => (
            <Card
              key={job.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="hover:text-primary text-lg font-semibold transition-colors">
                      {job.title}
                    </h3>
                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {job.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {job.date_posted
                          ? new Date(job.date_posted).toLocaleDateString()
                          : 'Date not available'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {job.min_amount && job.max_amount
                        ? `$${job.min_amount.toLocaleString()} - $${job.max_amount.toLocaleString()}`
                        : 'Salary not specified'}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {getSiteName(job.site)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              {/* <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {job.skills && job.skills.map((skill: any) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      // TODO: Add save and apply now buttons
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Save
                        </Button>
                        <Button size="sm">Apply Now</Button>
                      </div>
                    </div>
                  </CardContent> */}
            </Card>
          ))
        ) : (
          // Empty state
          <Card className="p-12 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
              <Search className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters to find more
              results.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                navigate({
                  to: '/',
                  search: {},
                  replace: true,
                });
              }}
            >
              Clear all filters
            </Button>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(currentPageValue - 1, 1))}
            disabled={currentPageValue === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPageValue === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage(Math.min(currentPageValue + 1, totalPages))
            }
            disabled={currentPageValue === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </BaseLayout>
  );
}
