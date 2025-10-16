import gspread
import pandas as pd
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import tempfile
import os
import openpyxl

# --- ส่วนของการตั้งค่า ---
app = FastAPI()
origins = ["http://localhost:3000",
           "https://battle-of-talingchan-frontend.vercel.app"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
try:
    gc = gspread.service_account(filename='credentials.json')
    SHEET_ID = "1fFd4xC5aefiMd1_OK7lZRJ6RxXFE8tYF8xw1BgTtosE"
    sh = gc.open_by_key(SHEET_ID)
    print("เชื่อมต่อ Google Sheets สำเร็จ!")
except Exception as e:
    print(f"เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets: {e}")
    sh = None

# --- Pydantic Models ---
class Card(BaseModel):
    Name: str
    RuleName: str
    Type: str
    is_only_one: bool
    count: int = 1

class DeckListPDF(BaseModel):
    mainDeck: List[Card]
    lifeDeck: List[Card]
    deckName: str
    playerName: str

# --- REVISED: Endpoint ที่เขียนข้อมูลลง Template แล้วส่งเป็น .xlsx กลับมา ---
@app.post("/api/generate-tournament-pdf")
def generate_tournament_excel(decklist: DeckListPDF, background_tasks: BackgroundTasks):
    template_path = "deck_recipe_template.xlsx"

    try:
        workbook = openpyxl.load_workbook(template_path)
        sheet = workbook.active

        # --- เขียนข้อมูลผู้เล่นและเด็ค (เขียนลงไปตรงๆ) ---
        # หากเกิด Error 'MergedCell' อีกครั้ง ให้ Unmerge เซลล์เหล่านี้ในไฟล์ Excel
        sheet['C4'] = decklist.playerName
        sheet['C6'] = decklist.deckName

        # --- จัดกลุ่มการ์ด ---
        only_one_card = next((card for card in decklist.mainDeck if card.is_only_one), None)
        avatars = [card for card in decklist.mainDeck if card.Type == 'Avatar' and not card.is_only_one]
        magics = [card for card in decklist.mainDeck if card.Type == 'Magic']
        constructs = [card for card in decklist.mainDeck if card.Type == 'Construct']

        # --- เขียนข้อมูล Only#1 Main Deck ---
        if only_one_card:
            sheet['C10'] = only_one_card.Name

        # --- เขียนข้อมูล Avatar, Magic, Construct ---
        start_row = 13
        max_rows = 15
        for i in range(max_rows):
            if i < len(avatars):
                sheet[f'A{start_row + i}'] = avatars[i].count
                sheet[f'B{start_row + i}'] = avatars[i].Name
            if i < len(magics):
                sheet[f'D{start_row + i}'] = magics[i].count
                sheet[f'E{start_row + i}'] = magics[i].Name
            if i < len(constructs):
                sheet[f'G{start_row + i}'] = constructs[i].count
                sheet[f'H{start_row + i}'] = constructs[i].Name

        # --- เขียนข้อมูล Life Card ---
        start_row = 29
        for i, card in enumerate(decklist.lifeDeck):
            if i < 5:
                sheet[f'G{start_row + i}'] = card.Name

        # --- บันทึกเป็นไฟล์ชั่วคราว ---
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
            workbook.save(tmp.name)
            
            background_tasks.add_task(os.unlink, tmp.name)
            
            return FileResponse(
                tmp.name,
                media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename='tournament_decklist.xlsx'
            )

    except FileNotFoundError:
        return {"error": f"ไม่พบไฟล์ template: {template_path}"}
    except Exception as e:
        print(f"เกิดข้อผิดพลาดในการสร้าง Excel: {e}")
        return {"error": "ไม่สามารถสร้างไฟล์ Excel ได้"}


# --- Endpoint สำหรับดึงข้อมูลการ์ดทั้งหมด (ไม่มีการเปลี่ยนแปลง) ---
@app.get("/api/cards")
def get_all_cards():
    if sh is None: return {"error": "ไม่สามารถเชื่อมต่อกับ Google Sheets ได้"}
    try:
        card_worksheet = sh.worksheet("Card_List")
        card_rows = card_worksheet.get_all_records()
        df_cards = pd.DataFrame(card_rows)
        ban_worksheet = sh.worksheet("Ban_List")
        ban_rows = ban_worksheet.get_all_records()
        df_banlist = pd.DataFrame(ban_rows)
        df_cards['is_only_one'] = df_cards['Ex'] == 'Only#1'
        df_merged = pd.merge(df_cards, df_banlist, on="RuleName", how="left")
        cards_json = df_merged.fillna('').to_dict('records')
        return {"data": cards_json}
    except gspread.exceptions.WorksheetNotFound as e:
        return {"error": f"ไม่พบ Sheet: {e}"}
    except Exception as e:
        return {"error": f"เกิดข้อผิดพลาดในการประมวลผลข้อมูล: {e}"}