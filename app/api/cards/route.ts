// /app/api/cards/route.ts

import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Card } from '@/lib/googleSheets';

async function getCardDatabase(): Promise<Card[]> {
  try {
    const sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_API_KEY });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'database!A:M', // ดึงถึงคอลัมน์ M สำหรับรูปภาพ
    });

    const rows = response.data.values;
    if (!rows) return [];

    return rows.slice(1).map((row): Card => ({
      Name:     row[1] || '',
      RuleName: row[2] || '',
      Type:     row[3] || '',
      Symbol:   row[4] || '',
      Cost:     row[5] || '',
      CColor:   row[6] || '',
      Gem:      row[7] || '',
      GColor:   row[8] || '',
      Power:    row[9] || '',
      Ex:       row[10] || '',
      Rare:     row[11] || '',
      Image:    row[12] || undefined,
    }));
  } catch (err) {
    console.error('API Error fetching from Google Sheets:', err);
    throw new Error('Failed to fetch card database from API.');
  }
}

export async function GET() {
  try {
    const cards = await getCardDatabase();
    return NextResponse.json(cards);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}