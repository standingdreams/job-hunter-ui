import { createFileRoute } from '@tanstack/react-router';
import {
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  Facebook,
  Globe,
  Heart,
  Linkedin,
  MapPin,
  Share2,
  TrendingUp,
  Twitter,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { BaseLayout } from '@/layouts/BaseLayout';
import { companyData, jobData } from '@/lib/mockData';

export const Route = createFileRoute('/job/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const [isSaved, setIsSaved] = useState(false);

  const handleApply = () => {
    // In a real app, this would redirect to application form or external site
    alert('Redirecting to application form...');
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${jobData.title} at ${jobData.company}`,
        text: jobData.description,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Job link copied to clipboard!');
    }
  };

  return (
    <BaseLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Job Header */}
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div>
                <h1 className="text-foreground text-3xl font-bold">
                  {jobData.title}
                </h1>
                <div className="text-muted-foreground mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{jobData.company}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{jobData.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Posted {jobData.posted}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="px-3 py-1">
                  {jobData.type}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  {jobData.platform}
                </Badge>
                <span className="text-lg font-semibold text-green-600">
                  {jobData.salary}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {jobData.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className={isSaved ? 'border-red-200 text-red-500' : ''}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleApply} size="lg" className="px-8">
              Apply Now
            </Button>
            <Button variant="outline" size="lg">
              Easy Apply
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Job Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Job Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              {jobData.description}
            </p>
          </div>

          {/* Responsibilities */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Key Responsibilities</h2>
            <ul className="space-y-3">
              {jobData.responsibilities.map((responsibility, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full" />
                  <span className="text-muted-foreground">
                    {responsibility}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Qualifications */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Required Qualifications</h2>
            <ul className="space-y-3">
              {jobData.qualifications.map((qualification, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full" />
                  <span className="text-muted-foreground">{qualification}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Preferred Qualifications */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Preferred Qualifications</h2>
            <ul className="space-y-3">
              {jobData.preferredQualifications.map((qualification, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="bg-muted mt-2 h-2 w-2 flex-shrink-0 rounded-full" />
                  <span className="text-muted-foreground">{qualification}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Benefits & Perks</h2>
            <ul className="space-y-3">
              {jobData.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={companyData.logo || '/placeholder.svg'}
                    alt={companyData.name}
                  />
                  <AvatarFallback>TC</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{companyData.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {companyData.industry}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="mb-1 flex items-center justify-center">
                    <Users className="text-muted-foreground h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium">
                    {companyData.stats.employees}
                  </p>
                  <p className="text-muted-foreground text-xs">Employees</p>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-center">
                    <Building2 className="text-muted-foreground h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium">
                    {companyData.stats.offices}
                  </p>
                  <p className="text-muted-foreground text-xs">Offices</p>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-center">
                    <TrendingUp className="text-muted-foreground h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium">{companyData.founded}</p>
                  <p className="text-muted-foreground text-xs">Founded</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 font-medium">About the Company</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {companyData.overview}
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-medium">Company Culture</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {companyData.culture}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent"
                  asChild
                >
                  <a
                    href={companyData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="h-4 w-4" />
                    Visit Website
                    <ExternalLink className="ml-auto h-3 w-3" />
                  </a>
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    asChild
                  >
                    <a
                      href={companyData.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    asChild
                  >
                    <a
                      href={companyData.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    asChild
                  >
                    <a
                      href={companyData.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Ready to Apply?</h3>
                <p className="text-muted-foreground">
                  Join {companyData.name} and take your career to the next
                  level.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSave}>
                  {isSaved ? 'Saved' : 'Save Job'}
                </Button>
                <Button onClick={handleApply} size="lg">
                  Apply Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Similar Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Similar Jobs</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Frontend Developer',
                company: 'StartupXYZ',
                salary: '$100k - $130k',
              },
              {
                title: 'React Developer',
                company: 'WebCorp',
                salary: '$110k - $140k',
              },
              {
                title: 'UI Developer',
                company: 'DesignTech',
                salary: '$95k - $125k',
              },
            ].map((job, index) => (
              <div
                key={index}
                className="hover:bg-muted/50 cursor-pointer rounded-lg border p-3 transition-colors"
              >
                <h4 className="text-sm font-medium">{job.title}</h4>
                <p className="text-muted-foreground text-xs">{job.company}</p>
                <p className="mt-1 text-xs font-medium text-green-600">
                  {job.salary}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
}
