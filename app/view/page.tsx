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
  
  const totalInCategory = cards.reduce((sum, card) => sum + getCardCount(card.RuleName), 0);

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-brand-primary border-b-2 border-brand-surface-light pb-2 mb-4">
        {title} ({totalInCategory})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {cards.sort((a,b) => a.Name.localeCompare(b.Name)).map(card => (
          <div key={card.RuleName} className="relative">
            {/* Badge แสดงจำนวนการ์ด */}
            <div className="absolute top-2 right-2 z-10 bg-brand-bg bg-opacity-80 text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-brand-primary">
              x{getCardCount(card.RuleName)}
            </div>
            {/* รูปภาพการ์ด */}
            {card.Image ? (
               <Image src={card.Image} alt={card.Name} width={300} height={420} className="rounded-lg shadow-lg" />
            ) : (
              <div className="aspect-[3/4] bg-brand-surface rounded-lg flex items-center justify-center text-center p-2">
                <p className="text-white text-sm">{card.Name}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


export default function ViewPage() {
  const { cards, playerName, deckName, getCardCount } = useDeckStore();
  const router = useRouter();

  useEffect(() => {
    if (cards.length === 0) router.push('/');
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

  if (cards.length === 0) return <div className="p-8 bg-brand-bg text-white">Redirecting...</div>;

  return (
    <div className="bg-brand-bg text-white min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-brand-primary">{deckName || "Untitled Deck"}</h1>
          <h2 className="text-2xl text-gray-300">by {playerName || "Anonymous"}</h2>
        </header>
        
        <div className="mb-6 text-center">
            <button onClick={() => router.push('/')} className="bg-brand-surface hover:bg-brand-surface-light text-white px-6 py-2 rounded-lg transition-colors">
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