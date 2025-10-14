// /app/print/page.tsx
"use client";

import { useDeckStore } from "@/store/deckStore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Card } from "@/lib/googleSheets";

// --- Component ย่อยสำหรับสร้างแถวว่างๆ ---
const EmptyRow = () => (
  <>
    <div className="border border-black h-7">&nbsp;</div>
    <div className="border border-black h-7">&nbsp;</div>
  </>
);

export default function PrintPage() {
  const { cards, playerName, deckName, getCardCount } = useDeckStore();
  const router = useRouter();

  useEffect(() => {
    if (cards.length === 0) router.push('/');
  }, [cards, router]);

  // --- จัดหมวดหมู่การ์ด (Logic เดิม) ---
  const { mainDeckAvatars, magicCards, constructCards, lifeCards } = useMemo(() => {
    const uniqueCards = Array.from(new Map(cards.map(card => [card.RuleName, card])).values());
    const only1 = uniqueCards.find(c => c.Ex?.toLowerCase().includes('only#1'));
    const avatars = uniqueCards.filter(c => c.Type === 'Avatar' && !c.Ex?.toLowerCase().includes('only#1'));
    return {
      mainDeckAvatars: (only1 ? [only1] : []).concat(avatars).sort((a, b) => a.Name.localeCompare(b.Name)),
      magicCards: uniqueCards.filter(c => c.Type === 'Magic').sort((a, b) => a.Name.localeCompare(b.Name)),
      constructCards: uniqueCards.filter(c => c.Type === 'Construct').sort((a, b) => a.Name.localeCompare(b.Name)),
      lifeCards: uniqueCards.filter(c => c.Type?.toLowerCase().includes('life')).sort((a, b) => a.Name.localeCompare(b.Name)),
    };
  }, [cards]);

  if (cards.length === 0) return null;

  // --- สร้างแถวสำหรับแต่ละหมวดหมู่ ---
  const avatarRows = Array.from({ length: 18 }, (_, i) => mainDeckAvatars[i]);
  const magicRows = Array.from({ length: 13 }, (_, i) => magicCards[i]);
  const constructRows = Array.from({ length: 13 }, (_, i) => constructCards[i]);
  const lifeRows = Array.from({ length: 5 }, (_, i) => lifeCards[i]);


  return (
    <div className="bg-white text-black p-4 font-sans">
      <div className="max-w-4xl mx-auto border-2 border-black p-2">
        <header className="text-center mb-2">
          <h1 className="text-xl font-bold">Battle of Talingchan Deck Recipe</h1>
        </header>

        {/* --- ส่วนข้อมูลผู้เล่น --- */}
        <section className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr] text-sm mb-2">
          <div className="border border-black p-1"><strong>ชื่อ-นามสกุล:</strong> {playerName}</div>
          <div className="border border-black p-1"><strong>Game Name:</strong> {deckName}</div>
          <div className="border border-black p-1">ลำดับผู้เข้าแข่งขัน</div>
          <div className="border border-black p-1"></div>
          <div className="border border-black p-1">ชื่อการแข่งขัน</div>
          <div className="border border-black p-1"></div>
          <div className="border border-black p-1">อักษรขึ้นต้นนามสกุล</div>
          <div className="border border-black p-1"></div>
        </section>

        {/* --- ส่วน Main Deck --- */}
        <h2 className="text-center font-bold text-md mb-1">Only#1 Main Deck</h2>
        <section className="grid grid-cols-2 gap-x-[-1px]">
          {/* คอลัมน์ซ้าย: Avatar */}
          <div className="grid grid-cols-[1fr_80px] text-sm">
            <div className="font-bold text-center border border-black">Avatar</div>
            <div className="font-bold text-center border border-black">จำนวน</div>
            {avatarRows.map((card, i) =>
              card ? (
                <>
                  <div key={card.RuleName + i} className="border border-black p-1 h-7">{card.Name}</div>
                  <div className="border border-black p-1 h-7 text-center">{getCardCount(card.RuleName)}</div>
                </>
              ) : <EmptyRow key={`empty-avatar-${i}`} />
            )}
          </div>
          {/* คอลัมน์ขวา: Magic, Construct, Life */}
          <div>
            <div className="grid grid-cols-[1fr_80px] text-sm">
              <div className="font-bold text-center border border-black">Magic</div>
              <div className="font-bold text-center border border-black">จำนวน</div>
              {magicRows.map((card, i) =>
                card ? (
                  <>
                    <div key={card.RuleName + i} className="border border-black p-1 h-7">{card.Name}</div>
                    <div className="border border-black p-1 h-7 text-center">{getCardCount(card.RuleName)}</div>
                  </>
                ) : <EmptyRow key={`empty-magic-${i}`} />
              )}
            </div>
            <div className="grid grid-cols-[1fr_80px] text-sm mt-[-1px]">
              <div className="font-bold text-center border border-black">Construct</div>
              <div className="font-bold text-center border border-black">จำนวน</div>
              {constructRows.map((card, i) =>
                card ? (
                  <>
                    <div key={card.RuleName + i} className="border border-black p-1 h-7">{card.Name}</div>
                    <div className="border border-black p-1 h-7 text-center">{getCardCount(card.RuleName)}</div>
                  </>
                ) : <EmptyRow key={`empty-construct-${i}`} />
              )}
            </div>
            <div className="grid grid-cols-1 text-sm mt-[-1px]">
               {lifeRows.map((card, i) =>
                card ? (
                  <div key={card.RuleName + i} className="grid grid-cols-[1fr_80px]">
                    <div className="font-bold text-center border border-black">Life Card</div>
                    <div className="border border-black p-1 h-7 text-center">{card.Name}</div>
                  </div>
                ) : (
                  <div key={`empty-life-${i}`} className="grid grid-cols-[1fr_80px]">
                    <div className="font-bold text-center border border-black">Life Card</div>
                    <div className="border border-black p-1 h-7">&nbsp;</div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

         {/* --- ส่วน Side Deck (แสดงเป็นฟอร์มเปล่า) --- */}
        <h2 className="text-center font-bold text-md mb-1 mt-2">Side Deck</h2>
        <section className="grid grid-cols-2 gap-x-[-1px]">
           <div className="grid grid-cols-[1fr_80px] text-sm">
              <div className="font-bold text-center border border-black">Avatar Side Deck</div>
              <div className="font-bold text-center border border-black">จำนวน</div>
              {Array.from({length: 4}).map((_, i) => <EmptyRow key={`empty-side-avatar-${i}`} />)}
           </div>
           <div className="grid grid-cols-[1fr_80px] text-sm">
              <div className="font-bold text-center border border-black">Magic Side Deck</div>
              <div className="font-bold text-center border border-black">จำนวน</div>
              {Array.from({length: 4}).map((_, i) => <EmptyRow key={`empty-side-magic-${i}`} />)}
           </div>
        </section>

      </div>
      <footer className="text-center mt-4 no-print">
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-2 rounded-lg text-lg hover:bg-blue-700">
          Save as PDF / Print
        </button>
        <button onClick={() => router.push('/')} className="bg-gray-500 text-white px-6 py-2 rounded-lg ml-4 hover:bg-gray-600">
          Back to Editor
        </button>
      </footer>
      <style jsx global>{`
        @media print {
          .no-print { display: none; }
          body { background-color: #fff; }
          .p-4 { padding: 0; }
          .max-w-4xl { max-width: 100%; }
        }
      `}</style>
    </div>
  );
}