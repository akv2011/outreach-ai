
'use client';

import React, { useState, useCallback, ChangeEvent } from 'react';
import type { Lead, RawLeadData, PriorityScoreInfo } from '@/types';
import { parseCSV, transformRawDataToLead } from '@/lib/csv-parser';
import { calculatePriorityScore } from '@/lib/lead-scorer';
import { generateEmailOpener } from '@/ai/flows/generate-email-opener';
import { generateDeepDiveEmailOpener } from '@/ai/flows/generate-deep-dive-email-opener';
import { generateEmailSubject } from '@/ai/flows/generate-email-subject'; // Added
import { LeadTable } from './lead-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUp, AlertCircle, Loader2, Edit3 } from 'lucide-react';

export function OutreachDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAllOpeners, setIsGeneratingAllOpeners] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [salesGoal, setSalesGoal] = useState<string>('');
  const { toast } = useToast();

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setFileName(file.name);
    setLeads([]);

    try {
      const fileContent = await file.text();
      const rawDataArray: Partial<RawLeadData>[] = parseCSV(fileContent);
      
      let processedLeads: Lead[] = rawDataArray.map((rawData, index) => {
        const partialLead = transformRawDataToLead(rawData, `lead-${index}-${Date.now()}`);
        const priorityScoreInfo: PriorityScoreInfo = calculatePriorityScore(partialLead);
        return {
          companyName: 'Unknown Company', 
          industry: 'Unknown Industry',   
          location: 'Unknown Location',
          website: undefined,
          ownerEmail: undefined,
          id: `lead-fallback-${index}`, 
          ...partialLead, 
          priorityScoreInfo,
          isGeneratingOpener: false,
          isGeneratingSubject: false,
        } as Lead; 
      });

      processedLeads.sort((a, b) => b.priorityScoreInfo.total - a.priorityScoreInfo.total);
      setLeads(processedLeads); 

      toast({
        title: "CSV Processed & Leads Scored",
        description: `${processedLeads.length} leads loaded. Now generating AI openers...`,
      });
      setIsLoading(false); 

      setIsGeneratingAllOpeners(true);
      const leadsForOpenerGeneration = [...processedLeads]; 
      for (const lead of leadsForOpenerGeneration) {
        try {
          await handleGenerateOpener(lead.id, true, { 
            companyName: lead.companyName,
            industry: lead.industry, 
            location: lead.location, 
            website: lead.website, 
          });
        } catch (genError) {
          console.error(`Error generating opener for ${lead.companyName} in batch:`, genError);
        }
      }
      setIsGeneratingAllOpeners(false);
      toast({
        title: "AI Openers Generated",
        description: "All email openers have been generated.",
        className: "bg-accent text-accent-foreground"
      });

    } catch (err) {
      console.error("Error processing CSV:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during CSV processing.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "CSV Processing Failed",
        description: errorMessage,
      });
      setIsLoading(false);
      setIsGeneratingAllOpeners(false);
    } finally {
      event.target.value = ''; 
    }
  };

  const handleGenerateOpener = useCallback(async (
    leadId: string, 
    isBatch: boolean = false,
    directLeadData?: Pick<Lead, 'companyName' | 'industry' | 'location' | 'website'> 
  ) => {
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId ? { ...lead, isGeneratingOpener: true, aiOpener: undefined, aiSubject: undefined } : lead
      )
    );

    const leadInfoForProcessing = directLeadData 
      ? directLeadData
      : leads.find(l => l.id === leadId);

    if (!leadInfoForProcessing || !leadInfoForProcessing.companyName) {
      const errorMsg = `Lead data missing for ID ${leadId} (or its company name) for AI opener.`;
      console.error(errorMsg);
      if (!isBatch) {
        toast({ variant: "destructive", title: "Error", description: errorMsg });
      }
      setLeads(prevLeads => prevLeads.map(l => l.id === leadId ? { ...l, isGeneratingOpener: false, aiOpener: 'Error: Lead data missing' } : l));
      return;
    }
    
    const { companyName, industry, location, website } = leadInfoForProcessing;

     if (!industry || !location || industry === 'N/A' || location === 'N/A' || industry === 'Unknown Industry' || location === 'Unknown Location') {
      const errorMsg = `Missing industry or location for ${companyName}. Skipping AI opener.`;
      console.warn(errorMsg);
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, aiOpener: 'Missing data for AI', isGeneratingOpener: false } : lead
        )
      );
      if (!isBatch) {
         toast({
            variant: "default",
            title: "AI Opener Skipped",
            description: errorMsg,
          });
      }
      return;
    }

    try {
      const inputForGenkit = {
        companyName: companyName,
        industry: industry,
        location: location,
        salesGoal: salesGoal || undefined,
        ...(website && { website: website }) 
      };

      const result = await generateEmailOpener(inputForGenkit);
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, aiOpener: result.opener, isGeneratingOpener: false } : lead
        )
      );
      if (!isBatch) {
        toast({
          title: "AI Opener Generated",
          description: `Opener created for ${companyName}.`,
          className: "bg-accent text-accent-foreground"
        });
      }
    } catch (err) {
      console.error("Error generating AI opener for lead:", companyName, err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI opener.';
       setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, isGeneratingOpener: false, aiOpener: 'Error generating' } : lead
        )
      );
      if (!isBatch) {
        toast({
          variant: "destructive",
          title: "AI Opener Generation Failed",
          description: `For ${companyName}: ${errorMessage}`,
        });
      }
    }
  }, [leads, toast, salesGoal]); 

  const handleDeepDiveOpener = useCallback(async (leadId: string) => {
    const leadToProcess = leads.find(l => l.id === leadId);
    if (!leadToProcess || !leadToProcess.website) {
      toast({
        variant: "destructive",
        title: "Deep Dive Error",
        description: `Lead or website URL not found for ID ${leadId}. Cannot perform deep dive.`,
      });
      return;
    }

    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId ? { ...lead, isGeneratingOpener: true, aiOpener: undefined, aiSubject: undefined } : lead
      )
    );

    toast({
      title: "Deep Dive Started...",
      description: `Scraping ${leadToProcess.companyName}'s website and generating opener. This may take a moment.`,
    });

    try {
      const inputForGenkit = {
        companyName: leadToProcess.companyName,
        industry: leadToProcess.industry,
        location: leadToProcess.location,
        websiteUrl: leadToProcess.website,
        salesGoal: salesGoal || undefined,
      };

      const result = await generateDeepDiveEmailOpener(inputForGenkit);
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, aiOpener: result.opener, isGeneratingOpener: false } : lead
        )
      );
      toast({
        title: "Deep Dive Opener Generated!",
        description: `Hyper-personalized opener created for ${leadToProcess.companyName}.`,
        className: "bg-accent text-accent-foreground"
      });
    } catch (err) {
      console.error("Error during deep dive for lead:", leadToProcess.companyName, err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate deep dive opener.';
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, isGeneratingOpener: false, aiOpener: 'Error in deep dive' } : lead
        )
      );
      toast({
        variant: "destructive",
        title: "Deep Dive Failed",
        description: `For ${leadToProcess.companyName}: ${errorMessage}`,
      });
    }
  }, [leads, salesGoal, toast]);

  const handleGenerateSubjectAndPrefillEmail = useCallback(async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead || !lead.aiOpener) {
      toast({ variant: "destructive", title: "Error", description: "Opener not available to prefill email." });
      return;
    }

    let subjectToUse = lead.aiSubject;

    if (!subjectToUse) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, isGeneratingSubject: true } : l));
      try {
        const subjectResult = await generateEmailSubject({
          companyName: lead.companyName,
          industry: lead.industry,
          opener: lead.aiOpener,
          salesGoal: salesGoal || undefined,
        });
        subjectToUse = subjectResult.subject;
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, aiSubject: subjectToUse, isGeneratingSubject: false } : l));
        toast({ title: "AI Subject Generated", description: `Subject ready for ${lead.companyName}.`, className: "bg-accent text-accent-foreground"});
      } catch (err) {
        console.error("Error generating AI subject for:", lead.companyName, err);
        const errorMsg = err instanceof Error ? err.message : "Failed to generate subject."
        toast({ variant: "destructive", title: "Subject Generation Failed", description: errorMsg });
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, isGeneratingSubject: false } : l));
        // Proceed with a generic subject if AI subject fails
        subjectToUse = `Following up with ${lead.companyName}`;
      }
    }
    
    const mailtoTo = lead.ownerEmail ? encodeURIComponent(lead.ownerEmail) : '';
    const mailtoSubject = encodeURIComponent(subjectToUse || `Following up with ${lead.companyName}`);
    const mailtoBody = encodeURIComponent(lead.aiOpener);
    window.open(`mailto:${mailtoTo}?subject=${mailtoSubject}&body=${mailtoBody}`);

  }, [leads, salesGoal, toast]);


  const handleCopyOpener = useCallback((opener: string) => {
    navigator.clipboard.writeText(opener)
      .then(() => {
        toast({ 
          title: "Copied to Clipboard!",
          description: "AI opener copied successfully.",
          className: "bg-accent text-accent-foreground"
        });
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: "Could not copy text to clipboard.",
        });
      });
  }, [toast]);

  const currentActionText = isLoading 
    ? 'Parsing CSV...' 
    : isGeneratingAllOpeners 
    ? 'Generating All Openers...' 
    : fileName 
    ? 'Upload New CSV' 
    : 'Upload CSV';

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <FileUp className="mr-3 h-7 w-7 text-primary" />
            Upload SaaSquatch Enrichment CSV
          </CardTitle>
          <CardDescription>
            Select your CSV file to parse leads, calculate priority scores, and generate AI email openers.
            Expected headers include: Company, Website, Industry, City, State, Revenue, Employee Count, Owner's Title, Owner's Email, BBB Rating.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isLoading || isGeneratingAllOpeners}
              className="flex-grow max-w-md"
              aria-label="Upload CSV file"
            />
            <Button onClick={() => document.getElementById('csv-upload')?.click()} disabled={isLoading || isGeneratingAllOpeners} className="w-full sm:w-auto">
              {(isLoading || isGeneratingAllOpeners) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileUp className="mr-2 h-4 w-4" />
              )}
              {currentActionText}
            </Button>
          </div>
          {fileName && !(isLoading || isGeneratingAllOpeners) && (
            <p className="mt-3 text-sm text-muted-foreground">
              Last uploaded: <span className="font-medium">{fileName}</span>
            </p>
          )}
          {error && (
             <Alert variant="destructive" className="mt-4">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
                <Edit3 className="mr-3 h-6 w-6 text-primary" />
                Customize AI Persona
            </CardTitle>
            <CardDescription>
                Optionally provide your sales goal or product focus to help the AI generate more tailored email openers and subjects.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid w-full max-w-md items-center gap-1.5">
                <Label htmlFor="sales-goal">My Sales Goal / Product Focus:</Label>
                <Input 
                    type="text" 
                    id="sales-goal" 
                    placeholder="e.g., Selling an AI-powered accounting tool" 
                    value={salesGoal}
                    onChange={(e) => setSalesGoal(e.target.value)}
                    className="max-w-md"
                />
            </div>
        </CardContent>
      </Card>

      <LeadTable 
        leads={leads} 
        onGenerateOpener={handleGenerateOpener} 
        onCopyOpener={handleCopyOpener}
        onDeepDive={handleDeepDiveOpener}
        onGenerateSubjectAndPrefillEmail={handleGenerateSubjectAndPrefillEmail}
      />
    </div>
  );
}
