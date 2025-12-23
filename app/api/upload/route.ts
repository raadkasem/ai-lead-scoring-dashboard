import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { Lead, ScoredLead } from '@/lib/types';
import { extractInsights } from '@/lib/llm';
import { calculateScore, isHotLead } from '@/lib/scoring';
import {
  saveUploadedFile,
  saveProcessedJson,
  setCurrentData,
  generateTimestamp,
} from '@/lib/fileStorage';

// Required columns (case-insensitive matching)
const REQUIRED_COLUMNS = ['id', 'name', 'make', 'modell', 'year', 'price estimation', 'transcript'];
const OPTIONAL_COLUMNS = ['last name', 'status', 'call successful', 'mileage', 'photo'];

interface ColumnMapping {
  id: string;
  name: string;
  lastName: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  priceEstimation: string;
  status: string;
  transcript: string;
  callSuccessful: string;
  photoUrl: string;
}

function findColumnMapping(headers: string[]): { mapping: ColumnMapping | null; missing: string[] } {
  const normalizedHeaders = headers.map(h => h?.toLowerCase().trim() || '');

  const findColumn = (variations: string[]): string => {
    for (const v of variations) {
      const idx = normalizedHeaders.findIndex(h => h === v || h.includes(v));
      if (idx !== -1) return headers[idx];
    }
    return '';
  };

  const mapping: ColumnMapping = {
    id: findColumn(['id']),
    name: findColumn(['name', 'first name', 'vorname']),
    lastName: findColumn(['last name', 'lastname', 'nachname', 'surname']),
    make: findColumn(['make', 'marke', 'manufacturer']),
    model: findColumn(['modell', 'model']),
    year: findColumn(['year', 'jahr', 'baujahr']),
    mileage: findColumn(['mileage', 'km', 'kilometer', 'kilometerstand', 'laufleistung', 'miles']),
    priceEstimation: findColumn(['price estimation', 'priceestimation', 'price', 'preis', 'schätzpreis']),
    status: findColumn(['status']),
    transcript: findColumn(['transcript', 'transkript', 'call transcript']),
    callSuccessful: findColumn(['call successful', 'callsuccessful', 'erfolg', 'successful']),
    photoUrl: findColumn(['photo', 'image', 'bild', 'foto', 'picture', 'photo url', 'image url', 'photourl', 'imageurl']),
  };

  // Check required columns
  const missing: string[] = [];
  if (!mapping.id) missing.push('ID');
  if (!mapping.name) missing.push('Name');
  if (!mapping.make) missing.push('Make');
  if (!mapping.model) missing.push('Modell');
  if (!mapping.year) missing.push('Year');
  if (!mapping.priceEstimation) missing.push('Price Estimation');
  if (!mapping.transcript) missing.push('Transcript');

  if (missing.length > 0) {
    return { mapping: null, missing };
  }

  return { mapping, missing: [] };
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', 'yes', 'ja', '1'].includes(value.toLowerCase());
  }
  if (typeof value === 'number') return value === 1;
  return false;
}

function isValidLead(obj: unknown): obj is Lead {
  if (!obj || typeof obj !== 'object') return false;
  const lead = obj as Record<string, unknown>;
  return (
    typeof lead.id === 'number' &&
    typeof lead.name === 'string' &&
    typeof lead.make === 'string' &&
    typeof lead.model === 'string' &&
    typeof lead.year === 'number' &&
    typeof lead.priceEstimation === 'number' &&
    typeof lead.transcript === 'string'
  );
}

async function processLeads(leads: Lead[]): Promise<ScoredLead[]> {
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

  // Sort by score descending
  scoredLeads.sort((a, b) => b.score - a.score);
  return scoredLeads;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', stage: 'validation' },
        { status: 400 }
      );
    }

    const timestamp = generateTimestamp();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let leads: Lead[] = [];

    // Check file type and process accordingly
    const isJson = file.type === 'application/json' || file.name.endsWith('.json');
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    file.type === 'application/vnd.ms-excel' ||
                    file.name.match(/\.xlsx?$/i);

    if (!isJson && !isExcel) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an Excel (.xlsx, .xls) or JSON file.', stage: 'validation' },
        { status: 400 }
      );
    }

    // Save original file
    saveUploadedFile(buffer, file.name);

    if (isJson) {
      // Parse JSON file
      try {
        const jsonContent = buffer.toString('utf-8');
        const parsed = JSON.parse(jsonContent);

        // Handle both array and object with leads property
        const rawLeads = Array.isArray(parsed) ? parsed : (parsed.leads || []);

        if (!Array.isArray(rawLeads) || rawLeads.length === 0) {
          return NextResponse.json(
            { error: 'JSON file must contain an array of leads', stage: 'validation' },
            { status: 400 }
          );
        }

        // Validate and map JSON leads
        leads = rawLeads.map((item: Record<string, unknown>, index: number) => ({
          id: Number(item.id) || index + 1,
          name: String(item.name || item.firstName || ''),
          lastName: String(item.lastName || item.last_name || ''),
          make: String(item.make || ''),
          model: String(item.model || item.modell || ''),
          year: Number(item.year) || new Date().getFullYear(),
          mileage: item.mileage || item.km ? Number(item.mileage || item.km) : undefined,
          priceEstimation: Number(item.priceEstimation || item.price_estimation || item.price || 0),
          status: String(item.status || 'pending'),
          transcript: String(item.transcript || ''),
          callSuccessful: parseBoolean(item.callSuccessful || item.call_successful),
          photoUrl: item.photoUrl || item.photo_url || item.photo || item.image ? String(item.photoUrl || item.photo_url || item.photo || item.image) : undefined,
        }));

        // Validate at least basic fields
        const invalidLeads = leads.filter(l => !l.name || !l.make || !l.model);
        if (invalidLeads.length > 0) {
          return NextResponse.json(
            { error: `Found ${invalidLeads.length} leads missing required fields (name, make, model)`, stage: 'validation' },
            { status: 400 }
          );
        }
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Invalid JSON format', stage: 'validation', details: String(parseError) },
          { status: 400 }
        );
      }
    } else {
      // Parse Excel file
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Try parsing with first row as headers
      let rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
      let headerRowIndex = 0;

      if (rows.length === 0) {
        return NextResponse.json(
          { error: 'Excel file is empty', stage: 'validation' },
          { status: 400 }
        );
      }

      // Check if first row has valid column headers
      let headers = Object.keys(rows[0]);
      let { mapping, missing } = findColumnMapping(headers);

      // If first row doesn't have valid headers, try second row
      if (!mapping && rows.length > 1) {
        // Re-parse with range starting from row 2 (index 1)
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        range.s.r = 1; // Start from second row
        worksheet['!ref'] = XLSX.utils.encode_range(range);

        // Parse again, treating row 2 as headers
        rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        if (rows.length > 0) {
          headers = Object.keys(rows[0]);
          const result = findColumnMapping(headers);
          mapping = result.mapping;
          missing = result.missing;
          headerRowIndex = 1;
        }
      }

      if (!mapping) {
        return NextResponse.json(
          {
            error: `Missing required columns: ${missing.join(', ')}. Check if headers are in row 1 or 2.`,
            stage: 'validation',
            missingColumns: missing,
            foundColumns: headers,
            hint: 'Column headers should be in the first or second row',
          },
          { status: 400 }
        );
      }

      // Convert to leads
      leads = rows.map((row, index) => ({
        id: Number(row[mapping.id]) || index + 1,
        name: String(row[mapping.name] || ''),
        lastName: String(row[mapping.lastName] || ''),
        make: String(row[mapping.make] || ''),
        model: String(row[mapping.model] || ''),
        year: Number(row[mapping.year]) || new Date().getFullYear(),
        mileage: mapping.mileage && row[mapping.mileage] ? Number(row[mapping.mileage]) : undefined,
        priceEstimation: Number(row[mapping.priceEstimation]) || 0,
        status: String(row[mapping.status] || 'pending'),
        transcript: String(row[mapping.transcript] || ''),
        callSuccessful: parseBoolean(row[mapping.callSuccessful]),
        photoUrl: mapping.photoUrl && row[mapping.photoUrl] ? String(row[mapping.photoUrl]) : undefined,
      }));
    }

    // Process leads with AI
    const scoredLeads = await processLeads(leads);

    // Save results
    saveProcessedJson(scoredLeads, timestamp);
    setCurrentData(scoredLeads);

    // Calculate stats
    const hotLeads = scoredLeads.filter(l => l.score >= 70).length;
    const warmLeads = scoredLeads.filter(l => l.score >= 40 && l.score < 70).length;
    const coldLeads = scoredLeads.filter(l => l.score < 40).length;
    const avgScore = Math.round(scoredLeads.reduce((sum, l) => sum + l.score, 0) / scoredLeads.length);

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${leads.length} leads`,
      data: {
        totalLeads: leads.length,
        hotLeads,
        warmLeads,
        coldLeads,
        avgScore,
        fileName: file.name,
        processedFile: `leads_${timestamp}.json`,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file', stage: 'processing', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve column requirements
export async function GET() {
  return NextResponse.json({
    requiredColumns: REQUIRED_COLUMNS,
    optionalColumns: OPTIONAL_COLUMNS,
    acceptedFormats: ['xlsx', 'xls', 'json'],
    columnDescriptions: {
      id: 'Unique identifier for each lead',
      name: 'First name of the contact',
      'last name': 'Last name of the contact (optional)',
      make: 'Car manufacturer (e.g., Tesla)',
      modell: 'Car model (e.g., Model 3)',
      year: 'Manufacturing year',
      mileage: 'Kilometers driven (optional)',
      'price estimation': 'Estimated price in EUR',
      status: 'Current call status (optional)',
      transcript: 'Full call transcript text',
      'call successful': 'Whether the call was successful (optional)',
      photo: 'Car image URL (optional)',
    },
    jsonFormat: {
      example: {
        id: 1,
        name: 'John',
        lastName: 'Doe',
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        mileage: 45000,
        priceEstimation: 35000,
        transcript: 'Call transcript here...',
        callSuccessful: true,
        photoUrl: 'https://example.com/car.jpg',
      },
    },
  });
}
