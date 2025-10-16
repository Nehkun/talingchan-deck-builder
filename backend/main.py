import gspread
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- ส่วนของการตั้งค่า ---
app = FastAPI()

# --- ตั้งค่า CORS ---
origins = [
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ส่วนของการเชื่อมต่อ Google Sheets ---
try:
    gc = gspread.service_account(filename='credentials.json')
    SHEET_ID = "1fFd4xC5aefiMd1_OK7lZRJ6RxXFE8tYF8xw1BgTtosE"
    sh = gc.open_by_key(SHEET_ID)
    print("เชื่อมต่อ Google Sheets สำเร็จ!")
except Exception as e:
    print(f"เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets: {e}")
    sh = None

# --- Endpoint สำหรับดึงข้อมูลการ์ดทั้งหมด ---
@app.get("/api/cards")
def get_all_cards():
    if sh is None:
        return {"error": "ไม่สามารถเชื่อมต่อกับ Google Sheets ได้"}

    try:
        card_worksheet = sh.worksheet("Card_List")
        card_rows = card_worksheet.get_all_records()
        df_cards = pd.DataFrame(card_rows)

        ban_worksheet = sh.worksheet("Ban_List")
        ban_rows = ban_worksheet.get_all_records()
        df_banlist = pd.DataFrame(ban_rows)

        df_cards['is_only_one'] = df_cards['Ex'] == 'Only#1'

        df_merged = pd.merge(
            df_cards,
            df_banlist,
            on="RuleName",
            how="left"
        )

        cards_json = df_merged.fillna('').to_dict('records')
        return {"data": cards_json}

    except gspread.exceptions.WorksheetNotFound as e:
        return {"error": f"ไม่พบ Sheet: {e}"}
    except Exception as e:
        return {"error": f"เกิดข้อผิดพลาดในการประมวลผลข้อมูล: {e}"}