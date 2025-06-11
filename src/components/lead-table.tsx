
'use client';

import type { Lead } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardCopy, RefreshCcw, Loader2, Info, HelpCircle, Microscope, Mail } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LeadTableProps {
  leads: Lead[];
  onGenerateOpener: (leadId: string) => void; 
  onCopyOpener: (opener: string) => void;
  onDeepDive: (leadId: string) => void;
  onGenerateSubjectAndPrefillEmail: (leadId: string) => void;
}

export function LeadTable({ leads, onGenerateOpener, onCopyOpener, onDeepDive, onGenerateSubjectAndPrefillEmail }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg bg-card text-card-foreground">
        <Info className="w-12 h-12 mb-4 text-muted-foreground" />
        <p className="text-xl font-semibold">No leads to display.</p>
        <p className="text-muted-foreground">Upload a CSV file or customize your AI persona above.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-lg border overflow-hidden shadow-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Company Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Owner's Email</TableHead>
              <TableHead>Website</TableHead>
              <TableHead className="text-right">Revenue ($M)</TableHead>
              <TableHead className="text-right">Employees</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>BBB Rating</TableHead>
              <TableHead className="text-right">Priority Score</TableHead>
              <TableHead className="w-[250px]">AI Email Opener</TableHead>
              <TableHead className="w-[200px]">AI Subject</TableHead>
              <TableHead className="text-center w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.companyName}</TableCell>
                <TableCell>{lead.industry}</TableCell>
                <TableCell>{lead.location}</TableCell>
                <TableCell>{lead.ownerEmail ?? <span className="text-muted-foreground">N/A</span>}</TableCell>
                <TableCell>
                  {lead.website ? (
                    <a 
                      href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline truncate max-w-[150px] block"
                      title={lead.website}
                    >
                      {lead.website}
                    </a>
                  ) : <span className="text-muted-foreground">N/A</span>}
                </TableCell>
                <TableCell className="text-right">{lead.revenue?.toLocaleString() ?? <span className="text-muted-foreground">N/A</span>}</TableCell>
                <TableCell className="text-right">{lead.employeeCount?.toLocaleString() ?? <span className="text-muted-foreground">N/A</span>}</TableCell>
                <TableCell>{lead.title ?? <span className="text-muted-foreground">N/A</span>}</TableCell>
                <TableCell>
                  {lead.bbbRating && lead.bbbRating !== 'N/A' && lead.bbbRating.trim() !== '' ? (
                    <Badge variant={lead.bbbRating.startsWith('A') ? "secondary" : lead.bbbRating.startsWith('F') || lead.bbbRating.startsWith('D') || lead.bbbRating.startsWith('NR') ? "destructive" : "outline" }>{lead.bbbRating}</Badge> 
                  ) : (
                    <Badge variant="outline">N/A</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Badge 
                        variant={lead.priorityScoreInfo.total > 70 ? "accent" : lead.priorityScoreInfo.total > 40 ? "default" : "outline"}
                        className="font-bold text-sm px-2 py-1 cursor-default"
                      >
                        {lead.priorityScoreInfo.total}
                        <HelpCircle className="h-3 w-3 ml-1 opacity-70" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs bg-popover text-popover-foreground">
                      <p className="font-semibold mb-1">Priority Score Breakdown:</p>
                      {lead.priorityScoreInfo.breakdown.explanations.length > 0 && !(lead.priorityScoreInfo.breakdown.explanations.length ===1 && lead.priorityScoreInfo.breakdown.explanations[0].includes("No specific scoring factors met")) ? (
                        <ul className="list-disc list-inside text-xs space-y-0.5">
                          {lead.priorityScoreInfo.breakdown.explanations.map((exp, idx) => (
                            <li key={idx}>{exp}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">No specific scoring factors contributed to the score.</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {lead.isGeneratingOpener ? (
                     <div className="flex items-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                     </div>
                  ) : lead.aiOpener ? (
                    <p className="text-sm italic">"{lead.aiOpener}"</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">AI opener will appear here.</p>
                  )}
                </TableCell>
                <TableCell>
                  {lead.isGeneratingSubject ? (
                     <div className="flex items-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                     </div>
                  ) : lead.aiSubject ? (
                    <p className="text-sm">"{lead.aiSubject}"</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">{lead.aiOpener ? 'Click mail icon' : 'N/A'}</p>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    {lead.aiOpener && !lead.isGeneratingOpener && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => onCopyOpener(lead.aiOpener!)} className="h-8 w-8">
                              <ClipboardCopy className="h-4 w-4" />
                              <span className="sr-only">Copy Opener</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Copy Opener</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onGenerateSubjectAndPrefillEmail(lead.id)}
                              disabled={lead.isGeneratingSubject || !lead.aiOpener}
                              className="h-8 w-8"
                            >
                              {lead.isGeneratingSubject ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                              <span className="sr-only">Prefill Email</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Prefill Email (generates subject if needed)</p></TooltipContent>
                        </Tooltip>
                      </>
                    )}
                    {!lead.isGeneratingOpener && (
                      <Tooltip>
                         <TooltipTrigger asChild>
                          <Button 
                            variant={lead.aiOpener ? "outline" : "default"} 
                            size="icon" 
                            onClick={() => onGenerateOpener(lead.id)}
                            className={`h-8 w-8 ${!lead.aiOpener ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
                          >
                            <RefreshCcw className="h-4 w-4" /> 
                            <span className="sr-only">{lead.aiOpener ? "Re-generate Opener" : "Generate Opener"}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{lead.aiOpener ? "Re-generate Standard AI Opener" : "Generate Standard AI Opener"}</p></TooltipContent>
                      </Tooltip>
                    )}
                     <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => onDeepDive(lead.id)}
                            disabled={!lead.website || lead.isGeneratingOpener || lead.isGeneratingSubject}
                            className="h-8 w-8"
                          >
                            <Microscope className="h-4 w-4" />
                            <span className="sr-only">Deep Dive Analysis</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Deep Dive (Scrape Website & Re-generate Opener)</p></TooltipContent>
                      </Tooltip>
                    {(lead.isGeneratingOpener || lead.isGeneratingSubject) && ( // Show loader if either opener or subject is generating
                       <Button variant="outline" size="icon" disabled  className="h-8 w-8">
                          <Loader2 className="h-4 w-4 animate-spin" />
                       </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
