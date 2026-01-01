import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MoreHorizontal, Filter, Download, Briefcase, MapPin, Mail, Linkedin, X, Check, Search, Calendar, RefreshCw, Sparkles, BrainCircuit, User } from 'lucide-react';
import { Lead } from '../types';
import { db } from '../utils/db';

export const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isScoring, setIsScoring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load leads from DB on mount
    const fetchLeads = async () => {
        setIsLoading(true);
        const data = await db.getLeads();
        setLeads(data);
        setIsLoading(false);
    };
    fetchLeads();
  }, []);

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedRows(newSelected);
  };

  const handleAIScoring = () => {
    setIsScoring(true);
    
    // Simulate AI Processing
    setTimeout(async () => {
        const updatedLeads = [...leads];
        const idsToScore = selectedRows.size > 0 
            ? Array.from(selectedRows) 
            : leads.filter(l => l.aiScore === undefined).map(l => l.id);

        for (const id of idsToScore) {
            const index = updatedLeads.findIndex(l => l.id === id);
            if (index !== -1) {
                // Mock Score Generation
                const score = Math.floor(Math.random() * (99 - 60 + 1) + 60);
                let reasoning = "Strong match for role.";
                if (score > 90) reasoning = "Perfect match! Skills and experience align perfectly with ICP.";
                else if (score > 80) reasoning = "Good candidate, relevant industry experience but slightly junior.";
                else reasoning = "Potential match, missing some key keywords but good background.";

                const newLead = {
                    ...updatedLeads[index],
                    aiScore: score,
                    aiReasoning: reasoning
                };
                
                updatedLeads[index] = newLead;
                
                // Update in DB
                await db.updateLead(newLead);
            }
        }

        setLeads(updatedLeads);
        setIsScoring(false);
        setSelectedRows(new Set()); // Clear selection
    }, 2000);
  };

  return (
    <div className="relative h-full flex flex-col gap-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
               Leads <Badge variant="outline" className="text-base px-2 py-0.5">{leads.length}</Badge>
            </h1>
            <p className="text-muted-foreground">Manage and organize your scraped candidates.</p>
         </div>
         <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
               <Download size={16} /> Export
            </Button>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
               <RefreshCw size={16} /> Sync to CRM
            </Button>
         </div>
      </div>

      {/* Toolbar */}
      <Card className="p-1.5 flex flex-wrap items-center gap-2 bg-secondary/30 backdrop-blur-sm border-border">
         <div className="relative flex-1 min-w-[240px]">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
           <input 
             type="text" 
             placeholder="Search by name, company, or title..." 
             className="w-full bg-transparent border-none rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
           />
         </div>
         <div className="h-6 w-px bg-border mx-2"></div>
         <div className="flex items-center gap-2 pr-2">
            <Button 
                variant="secondary" 
                size="sm" 
                className="gap-2 text-indigo-300 border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10"
                onClick={handleAIScoring}
                disabled={isScoring}
            >
              {isScoring ? <RefreshCw size={14} className="animate-spin"/> : <BrainCircuit size={14} />} 
              {isScoring ? 'Analyzing...' : 'AI Score'}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Filter size={14} /> Filters
            </Button>
         </div>
      </Card>

      {/* Data Table */}
      <div className="flex-1 rounded-xl border border-border bg-secondary/10 overflow-hidden relative shadow-inner">
        <div className="overflow-auto h-full">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input type="checkbox" 
                    onChange={() => {
                        if(selectedRows.size === leads.length) setSelectedRows(new Set());
                        else setSelectedRows(new Set(leads.map(l => l.id)));
                    }}
                    checked={selectedRows.size === leads.length && leads.length > 0}
                    className="rounded border-border bg-secondary text-indigo-500 focus:ring-indigo-500" 
                  />
                </th>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Role & Company</th>
                <th className="px-6 py-4 font-medium">AI Relevance</th>
                <th className="px-6 py-4 font-medium">Enrichment</th>
                <th className="px-6 py-4 font-medium">Stage</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                  <tr>
                      <td colSpan={7} className="text-center py-20 text-muted-foreground">
                          <div className="flex flex-col items-center gap-3">
                              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                              <span>Loading leads...</span>
                          </div>
                      </td>
                  </tr>
              ) : leads.length === 0 ? (
                  <tr>
                      <td colSpan={7} className="text-center py-20">
                          <div className="flex flex-col items-center gap-3 text-muted-foreground">
                              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                                  <User className="w-6 h-6 opacity-50" />
                              </div>
                              <p>No leads found. Start by scraping candidates.</p>
                              <Button variant="outline" size="sm" className="mt-2">Go to Scraper</Button>
                          </div>
                      </td>
                  </tr>
              ) : (
                leads.map((lead) => (
                    <tr 
                    key={lead.id} 
                    className={`group transition-all hover:bg-secondary/40 cursor-pointer ${selectedRows.has(lead.id) ? 'bg-indigo-500/10 hover:bg-indigo-500/15' : ''}`}
                    onClick={(e) => {
                        if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'A') {
                        setSelectedLead(lead);
                        }
                    }}
                    >
                    <td className="px-6 py-4">
                        <input 
                        type="checkbox" 
                        checked={selectedRows.has(lead.id)}
                        onChange={() => toggleRow(lead.id)}
                        className="rounded border-border bg-secondary text-indigo-500 focus:ring-indigo-500" 
                        />
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={lead.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.id}`} alt="" className="w-10 h-10 rounded-full object-cover border border-border" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full flex items-center justify-center">
                                <Linkedin size={10} className="text-blue-500" />
                            </div>
                        </div>
                        <div>
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{lead.firstName} {lead.lastName}</div>
                            <div className="text-xs text-muted-foreground truncate w-32">{lead.location}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm">{lead.company}</span>
                        <span className="text-xs text-muted-foreground max-w-[180px] truncate" title={lead.title}>{lead.title}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        {lead.aiScore !== undefined ? (
                            <div className="flex flex-col gap-1.5 w-24">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-muted-foreground">Match</span>
                                    <span className={`font-bold ${
                                        lead.aiScore >= 90 ? 'text-emerald-400' :
                                        lead.aiScore >= 70 ? 'text-amber-400' : 'text-red-400'
                                    }`}>{lead.aiScore}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            lead.aiScore >= 90 ? 'bg-emerald-500' :
                                            lead.aiScore >= 70 ? 'bg-amber-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${lead.aiScore}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : (
                            <Badge variant="outline" className="text-[10px] bg-secondary/50 text-muted-foreground border-border">Not Scored</Badge>
                        )}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                        {lead.emailStatus === 'valid' && <Badge variant="success" className="gap-1"><Check size={10}/> Verified</Badge>}
                        {lead.emailStatus === 'risky' && <Badge variant="warning">Risky</Badge>}
                        {lead.emailStatus === 'missing' && <Badge variant="outline" className="text-muted-foreground border-dashed">No Email</Badge>}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            lead.stage === 'replied' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            lead.stage === 'outreach' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            lead.stage === 'qualified' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            'bg-secondary text-muted-foreground border-border'
                        }`}>
                            {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={16} />
                        </Button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Bar */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-secondary/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 z-30 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
           <span className="font-medium text-sm">{selectedRows.size} Selected</span>
           <div className="h-4 w-px bg-white/20"></div>
           <div className="flex gap-2">
             <Button size="sm" className="bg-white text-black hover:bg-gray-200 border-0">Sync to Lemlist</Button>
             <Button size="sm" variant="secondary" onClick={handleAIScoring} disabled={isScoring} className="border border-white/10">
                {isScoring ? 'Processing...' : 'AI Score Selection'}
             </Button>
           </div>
           <button onClick={() => setSelectedRows(new Set())} className="ml-2 text-muted-foreground hover:text-white transition-colors">
             <X size={18} />
           </button>
        </div>
      )}

      {/* Lead Detail Sheet Overlay */}
      {selectedLead && (
         <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedLead(null)}></div>
           <div className="relative w-full max-w-xl bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Sheet Header */}
              <div className="p-6 border-b border-border flex items-start justify-between bg-secondary/20">
                 <div className="flex gap-5">
                    <img src={selectedLead.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedLead.id}`} alt="" className="w-20 h-20 rounded-2xl border-2 border-white/10 shadow-lg" />
                    <div className="pt-1">
                       <h2 className="text-2xl font-bold tracking-tight">{selectedLead.firstName} {selectedLead.lastName}</h2>
                       <p className="text-muted-foreground text-sm font-medium">{selectedLead.headline}</p>
                       <div className="flex items-center gap-3 mt-3">
                          <a href={selectedLead.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-400/10 p-1.5 rounded-md">
                             <Linkedin size={18} />
                          </a>
                          {selectedLead.email && (
                            <a href={`mailto:${selectedLead.email}`} className="text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-400/10 p-1.5 rounded-md">
                               <Mail size={18} />
                            </a>
                          )}
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedLead(null)} className="text-muted-foreground hover:text-white p-2 hover:bg-white/5 rounded-full transition-all">
                    <X size={24} />
                 </button>
              </div>

              {/* Sheet Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 
                 {/* AI Score Section */}
                 {selectedLead.aiScore && (
                    <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><BrainCircuit size={100} /></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={18} className="text-indigo-400"/>
                                    <span className="font-bold text-indigo-100">AI Relevance Score</span>
                                </div>
                                <span className="text-3xl font-bold text-indigo-400">{selectedLead.aiScore}</span>
                            </div>
                            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden mb-4">
                                <div className="h-full bg-indigo-500 rounded-full" style={{width: `${selectedLead.aiScore}%`}}></div>
                            </div>
                            <p className="text-sm text-indigo-200/80 italic leading-relaxed">
                                "{selectedLead.aiReasoning}"
                            </p>
                        </div>
                    </div>
                 )}

                 <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Summary</h3>
                    <p className="text-sm leading-7 text-gray-300">{selectedLead.summary || "No summary available."}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                       <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-secondary/30 border border-border">
                          <MapPin size={18} className="text-muted-foreground" />
                          <span>{selectedLead.location}</span>
                       </div>
                       <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-secondary/30 border border-border">
                          <Briefcase size={18} className="text-muted-foreground" />
                          <span>{selectedLead.company}</span>
                       </div>
                    </div>
                 </section>

                 <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Contact Information</h3>
                    <div className="space-y-3">
                       <div className="p-4 flex items-center justify-between rounded-lg border border-border bg-secondary/10">
                          <div className="flex items-center gap-4">
                             <div className="bg-[#0077b5]/10 p-2.5 rounded-lg text-[#0077b5]"><Linkedin size={20} /></div>
                             <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">LinkedIn Profile</span>
                                <span className="text-sm font-mono truncate max-w-[200px] text-blue-400 underline decoration-blue-400/30">linkedin.com/in/...</span>
                             </div>
                          </div>
                          <Badge variant="blue">Public</Badge>
                       </div>
                       <div className="p-4 flex items-center justify-between rounded-lg border border-border bg-secondary/10">
                          <div className="flex items-center gap-4">
                             <div className="bg-emerald-500/10 p-2.5 rounded-lg text-emerald-500"><Mail size={20} /></div>
                             <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Work Email</span>
                                <span className="text-sm font-mono truncate max-w-[200px]">{selectedLead.email || 'Not Found'}</span>
                             </div>
                          </div>
                          <Badge variant={selectedLead.emailStatus === 'valid' ? 'success' : 'destructive'}>
                             {selectedLead.emailStatus === 'valid' ? 'Verified' : 'Missing'}
                          </Badge>
                       </div>
                    </div>
                 </section>

              </div>

              {/* Sheet Footer */}
              <div className="p-6 border-t border-border bg-secondary/20 flex justify-end gap-3">
                 <Button variant="ghost" onClick={() => setSelectedLead(null)}>Close</Button>
                 <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">Open in Lemlist</Button>
              </div>

           </div>
         </div>
      )}
    </div>
  );
};