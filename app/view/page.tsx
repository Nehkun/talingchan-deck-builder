// /app/view/page.tsx
"use client";

import { useDeckStore } from "@/store/deckStore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Card } from "@/lib/googleSheets";
import Image from "next/image";

// Component ย่อยสำหรับแสดงการ์ดในแต่ละหมวดหมู่
const DeckCategoryView = ({ title, cards, getCardCount }: {
  title: string;
  cards: Card[];
  getCardCount: (ruleName: string) => number;
}) => {
  if (!cards || cards.length === 0) return null;
  
  // คำนวณจำนวนการ์ดทั้งหมดในหมวดหมู่นี้
  const totalInCategory = cards.reduce((sum, card) => sum + getCardCount(card.RuleName), 0);

  return (
    <section className="mb-8">
      <h3 className="text-2xl font-bold text-accent-primary border-b-2 border-dark-border pb-2 mb-4">
        {title} ({totalInCategory})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {cards.sort((a,b) => a.Name.localeCompare(b.Name)).map(card => (
          // --- ✨ การ์ดแต่ละใบถูกจัดให้อยู่ใน div ที่เป็น flex column ---
          <div key={card.RuleName} className="flex flex-col items-center">
            {/* รูปภาพการ์ด (ไม่มี Badge จำนวนการ์ดแล้ว) */}
            {card.Image ? (
               <Image 
                 src={card.Image} 
                 alt={card.Name} 
                 width={300} 
                 height={420} 
                 className="rounded-lg shadow-lg border-4 border-card-border w-full h-auto object-cover" // เพิ่ม w-full h-auto object-cover
               />
            ) : (
              <div className="aspect-[3/4] bg-dark-surface rounded-lg flex items-center justify-center text-center p-2 border-4 border-dark-border w-full">
                <p className="text-text-main text-sm">{card.Name}</p>
              </div>
            )}
             {/* --- ✨ ชื่อการ์ดและจำนวนการ์ดอยู่ด้านล่างรูปภาพ --- */}
            <div className="mt-2 text-center">
                <p className="text-text-main font-semibold text-base leading-tight">{card.Name}</p>
                <p className="text-text-muted text-sm mt-1">x{getCardCount(card.RuleName)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};


export default function ViewPage() {
  const { cards, playerName, deckName, getCardCount } = useDeckStore();
  const router = useRouter();

  useEffect(() => {
    if (cards.length === 0) {
      router.push('/');
    }
  }, [cards, router]);
  
  const { only1Card, avatarCards, magicCards, constructCards, lifeCards } = useMemo(() => {
    const uniqueCards = Array.from(new Map(cards.map(card => [card.RuleName, card])).values());
    return {
      only1Card: uniqueCards.find(c => c.Ex?.toLowerCase().includes('only#1')),
      avatarCards: uniqueCards.filter(c => c.Type === 'Avatar' && !c.Ex?.toLowerCase().includes('only#1')),
      magicCards: uniqueCards.filter(c => c.Type === 'Magic'),
      constructCards: uniqueCards.filter(c => c.Type === 'Construct'),
      lifeCards: uniqueCards.filter(c => c.Type?.toLowerCase().includes('life')),
    };
  }, [cards]);

  if (cards.length === 0) {
    return <div className="p-8 bg-dark-bg text-text-main text-center">Redirecting to editor...</div>;
  }

  return (
    <div className="bg-dark-bg text-text-main min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent-primary">{deckName || "Untitled Deck"}</h1>
          <h2 className="text-xl text-text-muted">by {playerName || "Anonymous"}</h2>
        </header>
        
        <div className="mb-8 text-center">
            <button 
              onClick={() => router.push('/')} 
              className="bg-dark-surface hover:bg-dark-border text-text-main px-6 py-2 rounded-lg transition-colors font-semibold"
            >
              ← Back to Editor
            </button>
        </div>

        <main>
          {only1Card && <DeckCategoryView title="Only#1" cards={[only1Card]} getCardCount={getCardCount} />}
          <DeckCategoryView title="Avatar" cards={avatarCards} getCardCount={getCardCount} />
          <DeckCategoryView title="Magic" cards={magicCards} getCardCount={getCardCount} />
          <DeckCategoryView title="Construct" cards={constructCards} getCardCount={getCardCount} />
          <DeckCategoryView title="Life Cards" cards={lifeCards} getCardCount={getCardCount} />
        </main>
      </div>
    </div>
  );
}