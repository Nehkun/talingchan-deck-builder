// /app/api/banlist/route.ts

import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export interface BanlistEntry {
  RuleName: string;
  AllowedCopies: number;
}

export async function GET() {
  try {
    const sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_API_KEY });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Banlist!A2:B',
    });

    const rows = response.data.values;
    if (!rows) return NextResponse.json([]);

    const banlist: BanlistEntry[] = rows.map(row => ({
      RuleName: row[0],
      AllowedCopies: parseInt(row[1], 10) || 0,
    }));

    return NextResponse.json(banlist);
  } catch (error) {
    console.error('API Error fetching from Banlist:', error);
    return NextResponse.json({ error: 'Failed to fetch banlist' }, { status: 500 });
  }
}