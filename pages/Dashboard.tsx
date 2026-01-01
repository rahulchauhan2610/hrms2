import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Activity, Database, Send, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';

const VELOCITY_DATA = [
  { day: 'Mon', profiles: 120 },
  { day: 'Tue', profiles: 155 },
  { day: 'Wed', profiles: 200 },
  { day: 'Thu', profiles: 180 },
  { day: 'Fri', profiles: 240 },
  { day: 'Sat', profiles: 90 },
  { day: 'Sun', profiles: 60 },
];

const FUNNEL_DATA = [
  { stage: 'Scraped', value: 1200 },
  { stage: 'Enriched', value: 950 },
  { stage: 'Synced', value: 800 },
  { stage: 'Replied', value: 120 },
];

const COLORS = ['#94a3b8', '#64748b', '#6366f1', '#10b981'];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2 text-sm">
           <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Apify Online
           </span>
           <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Lemlist Online
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-1 md:col-span-2 row-span-2 bg-gradient-to-br from-secondary/50 to-secondary/20">
          <CardHeader>
            <CardTitle>Scrape Velocity</CardTitle>
            <CardDescription>Daily extraction throughput</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={VELOCITY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} 
                  itemStyle={{ color: '#6366f1' }}
                />
                <Line type="monotone" dataKey="profiles" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1'}} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 row-span-2">
           <CardHeader>
            <CardTitle>Pipeline Efficiency</CardTitle>
            <CardDescription>Conversion from scrape to reply</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart layout="vertical" data={FUNNEL_DATA} margin={{ left: 20 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                 <XAxis type="number" stroke="#94a3b8" fontSize={12} hide />
                 <YAxis dataKey="stage" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={80}/>
                 <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                 <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                    {FUNNEL_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-1 lg:col-span-1 h-full">
           <CardHeader>
             <CardTitle className="text-sm font-medium text-muted-foreground">Credits Remaining</CardTitle>
             <div className="text-2xl font-bold mt-2">$45.20</div>
           </CardHeader>
           <CardContent>
             <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 w-[70%]"></div>
             </div>
             <p className="text-xs text-muted-foreground mt-2">Apify Plan: Developer</p>
           </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-1 lg:col-span-1 h-full">
           <CardHeader>
             <CardTitle className="text-sm font-medium text-muted-foreground">Daily Send Limit</CardTitle>
             <div className="text-2xl font-bold mt-2">124 / 200</div>
           </CardHeader>
           <CardContent>
             <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 w-[62%]"></div>
             </div>
             <p className="text-xs text-muted-foreground mt-2">Reset in 4 hours</p>
           </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-2 h-[300px] flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto pr-2">
            <div className="space-y-4">
              {[
                { icon: CheckCircle, color: 'text-emerald-400', text: 'Scrape Job #103 finished (148 profiles)', time: '2h ago' },
                { icon: MessageSquare, color: 'text-blue-400', text: 'Sarah Connor replied via LinkedIn', time: '4h ago' },
                { icon: Send, color: 'text-indigo-400', text: 'Campaign "Q2 Engineering" sent 45 emails', time: '6h ago' },
                { icon: AlertTriangle, color: 'text-amber-400', text: '2 Leads bounced in "SaaS Founders"', time: 'Yesterday' },
                { icon: Database, color: 'text-purple-400', text: 'Enriched 50 leads with email data', time: 'Yesterday' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <item.icon size={18} className={`mt-0.5 ${item.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};