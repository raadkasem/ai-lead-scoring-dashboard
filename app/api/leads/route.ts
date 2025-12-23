import { NextRequest, NextResponse } from 'next/server';
import { extractInsights } from '@/lib/llm';
import { calculateScore, isHotLead } from '@/lib/scoring';
import { Lead, ScoredLead } from '@/lib/types';
import { getCurrentData, setCurrentData } from '@/lib/fileStorage';
import fs from 'fs';
import path from 'path';

function loadStoredLeads(): ScoredLead[] | Lead[] | null {
  // First try current.json (processed leads)
  const currentData = getCurrentData<ScoredLead[]>();
  if (currentData && currentData.length > 0) {
    return currentData;
  }

  // Fallback to legacy leads.json (unprocessed)
  try {
    const legacyPath = path.join(process.cwd(), 'data', 'leads.json');
    if (fs.existsSync(legacyPath)) {
      const content = fs.readFileSync(legacyPath, 'utf-8');
      return JSON.parse(content) as Lead[];
    }
  } catch {
    // Ignore errors
  }

  return null;
}

function isScoredLead(lead: Lead | ScoredLead): lead is ScoredLead {
  return 'insights' in lead && 'score' in lead;
}

function calculateStats(leads: ScoredLead[]) {
  return {
    totalLeads: leads.length,
    hotLeads: leads.filter(l => l.score >= 70).length,
    warmLeads: leads.filter(l => l.score >= 40 && l.score < 70).length,
    coldLeads: leads.filter(l => l.score < 40).length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0,
    callsConnected: leads.filter(l => l.callSuccessful).length,
    qualified: leads.filter(l => l.insights?.call_outcome === 'qualified').length,
  };
}

// GET - Returns stored/cached leads (no reprocessing)
export async function GET() {
  try {
    const data = loadStoredLeads();

    if (!data || data.length === 0) {
      return NextResponse.json({
        leads: [],
        stats: {
          totalLeads: 0,
          hotLeads: 0,
          warmLeads: 0,
          coldLeads: 0,
          avgScore: 0,
          callsConnected: 0,
          qualified: 0,
        },
      });
    }

    // If already scored, return directly
    if (isScoredLead(data[0])) {
      const scoredLeads = data as ScoredLead[];
      return NextResponse.json({
        leads: scoredLeads,
        stats: calculateStats(scoredLeads),
      });
    }

    // Legacy unprocessed leads - process them once and store
    const leads = data as Lead[];
    const scoredLeads: ScoredLead[] = [];

    for (const lead of leads) {
      const insights = await extractInsights(lead.transcript);
      const scoreBreakdown = calculateScore(insights, lead.priceEstimation);

      scoredLeads.push({
        ...lead,
        insights,
        score: scoreBreakdown.total,
        isHot: isHotLead(scoreBreakdown.total),
      });
    }

    // Sort and save
    scoredLeads.sort((a, b) => b.score - a.score);
    setCurrentData(scoredLeads);

    return NextResponse.json({
      leads: scoredLeads,
      stats: calculateStats(scoredLeads),
    });
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      { error: 'Failed to load leads' },
      { status: 500 }
    );
  }
}

// POST - Force reprocess all leads
export async function POST(request: NextRequest) {
  try {
    const data = loadStoredLeads();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No leads to process' },
        { status: 400 }
      );
    }

    // Get base lead data (strip insights if already scored)
    const baseLeads: Lead[] = data.map(item => {
      if (isScoredLead(item)) {
        const { insights, score, isHot, ...lead } = item;
        return lead;
      }
      return item;
    });

    // Reprocess all leads
    const scoredLeads: ScoredLead[] = [];

    for (const lead of baseLeads) {
      const insights = await extractInsights(lead.transcript);
      const scoreBreakdown = calculateScore(insights, lead.priceEstimation);

      scoredLeads.push({
        ...lead,
        insights,
        score: scoreBreakdown.total,
        isHot: isHotLead(scoreBreakdown.total),
      });
    }

    // Sort and save
    scoredLeads.sort((a, b) => b.score - a.score);
    setCurrentData(scoredLeads);

    return NextResponse.json({
      success: true,
      message: `Reprocessed ${scoredLeads.length} leads`,
      leads: scoredLeads,
      stats: calculateStats(scoredLeads),
    });
  } catch (error) {
    console.error('Reprocess error:', error);
    return NextResponse.json(
      { error: 'Failed to reprocess leads' },
      { status: 500 }
    );
  }
}
