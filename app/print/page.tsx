// /app/print/page.tsx
"use client";

import { useDeckStore } from "@/store/deckStore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Card } from "@/lib/googleSheets";

// Component for displaying each category of cards
const PrintCategory = ({ title, cards, getCardCount }: {
  title: string;
  cards: Card[];
  getCardCount: (ruleName: string) => number;
}) => {
  if (!cards || cards.length === 0) return null;
  
  const totalInCategory = cards.reduce((sum, card) => sum + getCardCount(card.RuleName), 0);

  return (
    <div className="mb-4 break-inside-avoid">
      <h3 className="text-md font-semibold border-b-2 border-gray-300 pb-1 mb-2">{title} ({totalInCategory})</h3>
      <div className="space-y-1">
        {cards.sort((a,b) => a.Name.localeCompare(b.Name)).map(card => (
          <div key={card.RuleName} className="grid grid-cols-[1fr_auto] gap-x-4 text-sm">
            <span>{card.Name}</span>
            <span className="font-mono text-right">x{getCardCount(card.RuleName)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PrintPage() {
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

  if (cards.length === 0) return <div className="p-8">Redirecting...</div>;

  return (
    <div className="bg-gray-50 text-black min-h-screen">
      <div className="max-w-4xl mx-auto p-8 border border-gray-300 bg-white shadow-lg">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold">Battle of Talingchan</h1>
          <h2 className="text-2xl text-gray-600">Deck Recipe Sheet</h2>
        </header>
        
        <section className="grid grid-cols-2 gap-x-8 mb-6 border-y-2 border-black py-2 text-md">
          <p><strong>Player Name:</strong> {playerName || "____________________"}</p>
          <p><strong>Deck Name:</strong> {deckName || "____________________"}</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          {/* Left Column */}
          <div>
            {only1Card && <PrintCategory title="Only#1" cards={[only1Card]} getCardCount={getCardCount} />}
            <PrintCategory title="Avatar" cards={avatarCards} getCardCount={getCardCount} />
          </div>

          {/* Right Column */}
          <div>
            <PrintCategory title="Magic" cards={magicCards} getCardCount={getCardCount} />
            <PrintCategory title="Construct" cards={constructCards} getCardCount={getCardCount} />
          </div>
        </section>
        
        <section className="mt-4 border-t-2 border-gray-300 pt-4">
          <PrintCategory title="Life Cards" cards={lifeCards} getCardCount={getCardCount} />
        </section>

        <footer className="text-center mt-12 no-print">
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-2 rounded-lg text-lg hover:bg-blue-700 transition-colors">
              Print Deck List
            </button>
            <button onClick={() => router.push('/')} className="bg-gray-500 text-white px-6 py-2 rounded-lg ml-4 hover:bg-gray-600 transition-colors">
              Back to Editor
            </button>
        </footer>
      </div>
      <style jsx global>{`
        @media print {
          .no-print { display: none; }
          body { background-color: #fff; -webkit-print-color-adjust: exact; }
          .mx-auto { margin: 0; width: 100%; }
          .max-w-4xl { max-width: 100%; }
          .p-8 { padding: 0; }
          .border, .shadow-lg { border: none; box-shadow: none; }
        }
      `}</style>
    </div>
  );
}