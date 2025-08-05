import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState, useEffect } from "react"
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Calendar, Building2, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getSiteName } from '@/lib/shared'

export const Route = createFileRoute('/')({
  component: JobSearchDashboard,
})

function JobSearchDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [jobType, setJobType] = useState("all")
  const [location, setLocation] = useState("Atlanta, GA")
  const [hoursOld, setHoursOld] = useState("72")
  const [currentPage, setCurrentPage] = useState(1)
  const [includeRemote, setIncludeRemote] = useState(true)
  const jobsPerPage = 4

  // Debounce search query and location to avoid excessive API calls
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500)
  const [debouncedLocation] = useDebounce(location, 500)

  // Function to fetch jobs from FastAPI endpoint
  const fetchJobs = async (queryParams: {
    searchQuery: string;
    jobType: string;
    location: string;
    hoursOld: string;
    includeRemote: boolean;
    offset: number;
  }) => {
    const params = new URLSearchParams({
      search_term: queryParams.searchQuery || "software engineer (javascript OR typescript OR react OR nodejs OR express OR python OR postgresql OR mysql OR mongo OR redis)",
      is_remote: queryParams.includeRemote.toString(),
      location: queryParams.location,
      results_wanted: jobsPerPage.toString(),
      interval: "yearly",
      country: "USA",
      job_type: queryParams.jobType === "all" ? "" : queryParams.jobType,
      hours_old: queryParams.hoursOld,
      offset: queryParams.offset.toString()
    });

    // Add multiple site_name parameters
    const siteNames = ["indeed", "linkedin", "google"];
    siteNames.forEach(site => {
      params.append("site_name", site);
    });

    const response = await fetch(`http://127.0.0.1:8000/jobs?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Fetched jobs data:", data);
    // Return both jobs and total count for pagination
    if (Array.isArray(data)) {
      return { jobs: data, total: data.length };
    } else {
      return {
        jobs: data.jobs || [],
        total: data.total || data.count || (data.jobs ? data.jobs.length : 0)
      };
    }
  };

  // Calculate offset for server-side pagination
  const offset = (currentPage - 1) * jobsPerPage;

  // Use Tanstack Query to fetch jobs
  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', debouncedSearchQuery, jobType, debouncedLocation, hoursOld, includeRemote, currentPage],
    queryFn: () => fetchJobs({
      searchQuery: debouncedSearchQuery,
      jobType,
      location: debouncedLocation,
      hoursOld,
      includeRemote,
      offset
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const jobs = data?.jobs || [];
  const totalJobs = data?.total || 0;

  // Server-side pagination - no client-side filtering needed
  // The API returns already filtered and paginated results
  const totalPages = Math.ceil(totalJobs / jobsPerPage)
  const startIndex = (currentPage - 1) * jobsPerPage
  const paginatedJobs = jobs; // Jobs are already paginated from server

    // Reset to page 1 when filters change (excluding page changes)
  const filterDeps = [debouncedSearchQuery, jobType, debouncedLocation, hoursOld, includeRemote];
  const prevFilterDepsRef = useRef(filterDeps);

  useEffect(() => {
    const prevFilterDeps = prevFilterDepsRef.current;
    const filtersChanged = filterDeps.some((dep, index) => dep !== prevFilterDeps[index]);

    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
    }

    prevFilterDepsRef.current = filterDeps;
  }, filterDeps);

  // Scroll to top when page changes and data has loaded
  const prevPageRef = useRef(currentPage);

  useEffect(() => {
    const prevPage = prevPageRef.current;
    const pageChanged = currentPage !== prevPage;

    // Only scroll if page actually changed (not on initial load) and data is not loading
    if (pageChanged && prevPage !== currentPage && !isLoading) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    prevPageRef.current = currentPage;
  }, [currentPage, isLoading]);

  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader className="p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">JobFinder</h2>
              <p className="text-sm text-muted-foreground">Find your dream job</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Filters</SidebarGroupLabel>
            <SidebarGroupContent>
            <div className="flex flex-col gap-4 w-full">
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fulltime">Full-time</SelectItem>
                    <SelectItem value="parttime">Part-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Location (e.g., Atlanta, GA)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={hoursOld} onValueChange={setHoursOld}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Date Posted" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">Past 24 hours</SelectItem>
                    <SelectItem value="72">Past 3 days</SelectItem>
                    <SelectItem value="168">Past week</SelectItem>
                    <SelectItem value="720">Past month</SelectItem>
                    <SelectItem value="8760">Past year</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2 bg-background border rounded-md px-3 py-2">
                  <Checkbox id="include-remote" checked={includeRemote} onCheckedChange={(checked) => setIncludeRemote(checked === true)} />
                  <label
                    htmlFor="include-remote"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Include Remote Jobs
                  </label>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
          <SidebarTrigger className="-ml-1" />
        </header>

        <div className="flex-1 space-y-6 p-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                  <DropdownMenuItem>Clear all filters</DropdownMenuItem>
                  <DropdownMenuItem>Save current filters</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

                    {/* Results Summary */}
          <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading jobs..."
                : error
                  ? "Error loading jobs"
                : totalJobs > 0
                  ? `Showing ${startIndex + 1}-${startIndex + jobs.length} of ${totalJobs} jobs`
                  : "No jobs found"
              }
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
                      <div className="space-y-2 flex-1">
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
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-3" />
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
              <Card className="p-12 text-center">
                <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-red-50 flex items-center justify-center">
                  <div className="h-8 w-8 text-red-500">⚠️</div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Error loading jobs</h3>
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : 'An unexpected error occurred while fetching jobs.'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </Button>
              </Card>
            ) : paginatedJobs.length > 0 ? (
              // Job listings
              paginatedJobs.map((job: any) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold hover:text-primary transition-colors">{job.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                            {job.date_posted ? new Date(job.date_posted).toLocaleDateString() : 'Date not available'}
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
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                    {/* <div className="flex items-center justify-between">
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
                    </div> */}
                  </CardContent>
                </Card>
              ))
            ) : (
              // Empty state
              <Card className="p-12 text-center">
                <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters to find more results.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setJobType("all")
                    setLocation("Atlanta, GA")
                    setHoursOld("72")
                    setIncludeRemote(true)
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
