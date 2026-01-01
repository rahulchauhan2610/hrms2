// Scraper.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Play, Search, Loader2, AlertCircle, MapPin, Save, Plus, Target, Users } from 'lucide-react';
import { CandidateCard } from '../components/CandidateCard';
import { SENIORITY_MAPPING, EXPERIENCE_MAPPING } from '../constants';
import { ApifyProfile, Candidate, Campaign } from '../types';
import { MOCK_APIFY_RESPONSE } from '../mockData';
import { db } from '../utils/db';

export const Scraper: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSeniority, setSelectedSeniority] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [campaignName, setCampaignName] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  // Campaign Selection State
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // Context from URL
  const campaignId = searchParams.get('campaignId');

  useEffect(() => {
    // If we have a campaign ID, load its details to set context
    if (campaignId) {
        db.getCampaignById(campaignId).then(camp => {
            if (camp) {
                setCampaignName(camp.name);
                // Only set these if they aren't already set manually or via params
                if (!searchParams.get('keyword')) setKeyword(camp.targetJobTitle);
                if (!searchParams.get('location')) setLocation(camp.targetLocation);
            }
        });
    } else {
        // No campaign selected, load all available campaigns for selection
        setLoadingCampaigns(true);
        db.getCampaigns().then(camps => {
            setAllCampaigns(camps);
            setLoadingCampaigns(false);
        });
    }
  }, [campaignId]);

  // If manually typing in input, override the defaults
  useEffect(() => {
      const qKeyword = searchParams.get('keyword');
      const qLocation = searchParams.get('location');
      if (qKeyword) setKeyword(qKeyword);
      if (qLocation) setLocation(qLocation);
  }, [searchParams]);

  const toggleSelection = (id: string, currentList: string[], setter: (val: string[]) => void) => {
    if (currentList.includes(id)) {
      setter(currentList.filter(item => item !== id));
    } else {
      setter([...currentList, id]);
    }
  };

  const transformApifyData = (data: ApifyProfile): Candidate => {
    const latestExperience = data.experience && data.experience.length > 0 ? data.experience[0] : null;
    const currentPos = data.currentPosition && data.currentPosition.length > 0 ? data.currentPosition[0] : null;

    const role = latestExperience?.position || currentPos?.title || 'Open to work';
    const company = latestExperience?.companyName || currentPos?.companyName || 'Freelance';

    let skillsList: string[] = [];
    if (Array.isArray(data.skills)) {
      if (data.skills.length > 0) {
        if (typeof data.skills[0] === 'object' && data.skills[0] !== null && 'name' in data.skills[0]) {
           skillsList = (data.skills as any[]).map(s => s.name);
        } else if (typeof data.skills[0] === 'string') {
           skillsList = data.skills as string[];
        }
      }
    }

    return {
      id: data.publicIdentifier || Math.random().toString(36).substr(2, 9),
      fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      headline: data.headline || 'No Headline',
      currentRole: role,
      company: company,
      location: data.location?.linkedinText || 'Remote / Unknown',
      avatarUrl: data.profilePicture?.url || '',
      linkedinUrl: data.linkedinUrl || '',
      skills: skillsList,
      summary: data.about || '',
      verified: data.verified || false
    };
  };

  const handleSearch = async () => {
    if (!keyword) {
      setError("Please enter a job title or keyword to start the search.");
      return;
    }

    setLoading(true);
    setError(null);
    setCandidates([]);
    setSavedCount(0);

    // Simulate API Call with Mock Data
    setTimeout(() => {
        try {
            // Use the mock data provided
            const transformed = MOCK_APIFY_RESPONSE.map((item: any) => transformApifyData(item as ApifyProfile));
            setCandidates(transformed);
            setLoading(false);
        } catch (err: any) {
            setError("Failed to load mock data");
            setLoading(false);
        }
    }, 1500);
  };

  const handleSaveCandidate = async (candidate: Candidate) => {
    if (!campaignId) {
        alert("No campaign selected.");
        return;
    }
    const success = await db.addLead(candidate, campaignId);
    if (success) {
        setSavedCount(prev => prev + 1);
    } else {
        alert("Failed to save. Please check if your database tables exist.");
    }
  };

  const handleSaveAll = async () => {
    if (!campaignId) {
        alert("No campaign selected.");
        return;
    }

    setLoading(true);
    let successCount = 0;
    let failed = false;

    for (const candidate of candidates) {
        const success = await db.addLead(candidate, campaignId);
        if (success) successCount++;
        else failed = true;
    }
    
    setLoading(false);
    setSavedCount(successCount);
    
    if (failed && successCount === 0) {
        alert("Failed to save candidates. Database tables not found. Run the supabase_schema.sql script in Supabase.");
    } else {
        alert(`Saved ${successCount} candidates${campaignName ? ` to "${campaignName}"` : ' to database'}!`);
    }
  };

  // --- Campaign Selection View ---
  if (!campaignId) {
    return (
        <div className="max-w-6xl mx-auto p-8 animate-fade-in pb-20">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
                    <Target size={32} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-3">Select a Campaign</h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    To start scraping LinkedIn profiles, you must first select or create a campaign to store the leads.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create New Card */}
                <div 
                    onClick={() => navigate('/campaigns')}
                    className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-all min-h-[200px]"
                >
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:text-primary transition-colors border border-border">
                        <Plus size={24} />
                    </div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Create New Campaign</h3>
                    <p className="text-sm text-muted-foreground mt-2 text-center">Set up a new target audience</p>
                </div>

                {/* Loading State */}
                {loadingCampaigns && (
                    <div className="col-span-full flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Campaign Cards */}
                {!loadingCampaigns && allCampaigns.map(c => (
                    <Card 
                        key={c.id} 
                        className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 relative group overflow-hidden"
                        onClick={() => setSearchParams({ 
                            campaignId: c.id, 
                            keyword: c.targetJobTitle, 
                            location: c.targetLocation 
                        })}
                    >
                         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant={c.status === 'active' ? 'success' : 'outline'}>{c.status}</Badge>
                                <Users size={16} className="text-muted-foreground" />
                            </div>
                            <CardTitle className="truncate pr-4">{c.name}</CardTitle>
                            <CardDescription className="line-clamp-1 flex items-center gap-1 mt-1">
                                <Target size={12} /> {c.targetJobTitle}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-3 border-t border-border/50 bg-secondary/20">
                            <div className="flex justify-between w-full text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin size={10} /> {c.targetLocation || 'Global'}</span>
                                <span>{c.stats?.total || 0} Leads</span>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
  }

  // --- Scraper View ---
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-12 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/scraper')} className="-ml-2 text-muted-foreground">
                <Target size={14} className="mr-2" /> Change Campaign
            </Button>
            {campaignId && (
                <Badge variant="outline" className="text-muted-foreground border-primary/20 bg-primary/5 text-primary">
                    Saving to: {campaignName || 'Loading...'}
                </Badge>
            )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Candidate Search</h1>
        <p className="text-muted-foreground">Find and extract LinkedIn profiles using real-time filtering.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Filters & Search */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Search Criteria</CardTitle>
              <CardDescription>Target your ideal candidate profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Keywords</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input 
                    type="text" 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. Software Engineer" 
                    className="w-full bg-secondary/50 border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco" 
                    className="w-full bg-secondary/50 border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Seniority Level</label>
                <div className="flex flex-wrap gap-2">
                  {SENIORITY_MAPPING.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => toggleSelection(level.id, selectedSeniority, setSelectedSeniority)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selectedSeniority.includes(level.id)
                          ? 'bg-indigo-500/20 text-indigo-500 border-indigo-500/50 font-medium'
                          : 'bg-secondary/30 text-muted-foreground border-border hover:border-muted-foreground/50'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Years of Experience</label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_MAPPING.map((exp) => (
                    <button
                      key={exp.id}
                      onClick={() => toggleSelection(exp.id, selectedExperience, setSelectedExperience)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selectedExperience.includes(exp.id)
                          ? 'bg-indigo-500/20 text-indigo-500 border-indigo-500/50 font-medium'
                          : 'bg-secondary/30 text-muted-foreground border-border hover:border-muted-foreground/50'
                      }`}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                onClick={handleSearch} 
                disabled={loading} 
                className="w-full gap-2" 
                size="lg"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />} 
                {loading ? 'Searching...' : 'Run Search (Mock)'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-8 space-y-6">
          {candidates.length > 0 ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">{candidates.length} Candidates Found</h2>
                    {savedCount > 0 && <Badge variant="success">{savedCount} Saved</Badge>}
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant="warning">Mock Data Loaded</Badge>
                    <Button size="sm" onClick={handleSaveAll} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                        <Save size={16} /> Save All
                    </Button>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {candidates.map((candidate) => (
                   <CandidateCard 
                     key={candidate.id} 
                     candidate={candidate} 
                     onSave={handleSaveCandidate}
                   />
                 ))}
               </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-xl bg-secondary/5">
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Search size={20} className="text-indigo-500/50" />
                      </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Fetching Mock Data...</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">Simulating Apify response delay...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
                    <Search className="text-muted-foreground w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium">No results yet</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                    Enter your search criteria on the left and hit "Run Search" to fetch real-time data from LinkedIn.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};