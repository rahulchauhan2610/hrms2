import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Plus, Target, MapPin, BarChart3, ArrowRight, Loader2 } from 'lucide-react';
import { Campaign } from '../types';
import { db } from '../utils/db';

export const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form State
  const [newCampName, setNewCampName] = useState('');
  const [newCampJob, setNewCampJob] = useState('');
  const [newCampLoc, setNewCampLoc] = useState('');

  const fetchCampaigns = async () => {
    setLoading(true);
    const data = await db.getCampaigns();
    setCampaigns(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName || !newCampJob) return;
    
    setCreating(true);
    try {
      await db.createCampaign(newCampName, newCampJob, newCampLoc);
      await fetchCampaigns();
      setShowCreateModal(false);
      
      // Reset form
      setNewCampName('');
      setNewCampJob('');
      setNewCampLoc('');
    } catch (error) {
      console.error("Failed to create campaign:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Manage your outreach pipelines and lead sources.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Create Campaign
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <h2 className="text-xl font-semibold mb-2">No Campaigns Yet</h2>
          <p className="text-muted-foreground mb-4">Create your first campaign to start finding leads.</p>
          <Button onClick={() => setShowCreateModal(true)}>Create Campaign</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(campaign => (
            <Card 
              key={campaign.id} 
              className="cursor-pointer hover:border-primary/50 transition-all group relative overflow-hidden flex flex-col"
            >
               <div 
                 className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity z-0"
                 onClick={() => navigate(`/campaigns/${campaign.id}`)}
               ></div>
               
               <CardHeader className="pb-4 z-10 relative">
                  <div className="flex justify-between items-start">
                     <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                        <Target size={20} className="text-indigo-400" />
                     </div>
                     <Badge variant={campaign.status === 'active' ? 'success' : 'outline'}>{campaign.status}</Badge>
                  </div>
                  <CardTitle className="mt-4 truncate">{campaign.name}</CardTitle>
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Target size={12} />
                      <span className="truncate max-w-[200px]">{campaign.targetJobTitle}</span>
                    </div>
                    {campaign.targetLocation && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        <span className="truncate max-w-[200px]">{campaign.targetLocation}</span>
                      </div>
                    )}
                  </div>
               </CardHeader>
               
               <CardContent className="z-10 relative flex-1">
                  <div className="grid grid-cols-3 gap-2 text-center mt-2">
                     <div className="bg-secondary/50 rounded-lg p-2 border border-border/50">
                        <div className="text-xl font-bold">{campaign.stats?.total || 0}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Leads</div>
                     </div>
                     <div className="bg-secondary/50 rounded-lg p-2 border border-border/50">
                        <div className="text-xl font-bold text-indigo-400">{campaign.stats?.qualified || 0}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Qualified</div>
                     </div>
                     <div className="bg-secondary/50 rounded-lg p-2 border border-border/50">
                        <div className="text-xl font-bold text-emerald-400">{campaign.stats?.replied || 0}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Replies</div>
                     </div>
                  </div>
               </CardContent>
               
               <CardFooter className="pt-2 z-10 relative border-t border-border/50">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between hover:bg-secondary group-hover:text-primary transition-colors text-muted-foreground text-sm" 
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  >
                     Open Pipeline <ArrowRight size={16} />
                  </Button>
               </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <Card className="w-full max-w-md bg-background border-border relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <CardDescription>Define your target audience to automate scraping.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Campaign Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="e.g., Q3 SaaS Founders Outreach" 
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={newCampName}
                    onChange={e => setNewCampName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Job Title</label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="e.g., Chief Technology Officer" 
                      className="w-full bg-secondary border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={newCampJob}
                      onChange={e => setNewCampJob(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="e.g., New York, United States" 
                      className="w-full bg-secondary border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={newCampLoc}
                      onChange={e => setNewCampLoc(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t border-border bg-secondary/30 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Campaign'}</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};