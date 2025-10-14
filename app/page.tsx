// /app/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/lib/googleSheets";
import { useDeckStore } from "@/store/deckStore";
import DeckList from "@/components/DeckList";
import CardDisplay from "@/components/CardDisplay";

interface BanlistEntry { RuleName: string; AllowedCopies: number; }

export default function HomePage() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [banlist, setBanlist] = useState<BanlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [selectedRare, setSelectedRare] = useState("");
  const [showOnly1, setShowOnly1] = useState(false);
  const { cards: deckCards, addCard, removeCard, getCardCount, clearDeck } = useDeckStore();

  useEffect(() => {
    async function fetchData() {
      try {
        const [cardsRes, banlistRes] = await Promise.all([ fetch('/api/cards'), fetch('/api/banlist') ]);
        const cards = await cardsRes.json();
        const banlistData = await banlistRes.json();
        setAllCards(cards);
        setBanlist(banlistData);
      } catch (error) { console.error("Failed to load initial data:", error); }
      finally { setIsLoading(false); }
    }
    fetchData();
  }, []);

  const handleCardClick = (card: Card) => { addCard(card, banlist); };

  const filterOptions = useMemo(() => {
    const types = [...new Set(allCards.map(c => c.Type))].filter(Boolean).sort();
    const colors = [...new Set(allCards.map(c => c.CColor))].filter(Boolean).sort();
    const symbols = [...new Set(allCards.map(c => c.Symbol))].filter(Boolean).sort();
    const rares = [...new Set(allCards.map(c => c.Rare))].filter(Boolean).sort();
    return { types, colors, symbols, rares };
  }, [allCards]);

  const filteredCards = allCards.filter(card => {
    return card.Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedType || card.Type === selectedType) &&
      (!selectedColor || card.CColor === selectedColor) &&
      (!selectedSymbol || card.Symbol === selectedSymbol) &&
      (!selectedRare || card.Rare === selectedRare) &&
      (!showOnly1 || card.Ex?.toLowerCase().includes('only#1'));
  });

  if (isLoading) { return <div className="text-center mt-20 text-white">Loading Card Database...</div>; }

  return (
    <main className="flex flex-col h-screen bg-brand-bg text-white">
      <h1 className="text-2xl font-bold p-4 text-center border-b border-brand-surface-light">
        Battle of Talingchan Deck Builder
      </h1>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-3/4 flex flex-col p-4">
          <div className="mb-4 space-y-2">
            <input type="text" placeholder="Search by name..." className="w-full p-2 bg-brand-surface border border-brand-surface-light rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <select onChange={(e) => setSelectedType(e.target.value)} value={selectedType} className="p-2 bg-brand-surface border border-brand-surface-light rounded-lg text-sm"><option value="">All Types</option>{filterOptions.types.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
              <select onChange={(e) => setSelectedColor(e.target.value)} value={selectedColor} className="p-2 bg-brand-surface border border-brand-surface-light rounded-lg text-sm"><option value="">All Colors</option>{filterOptions.colors.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
              <select onChange={(e) => setSelectedSymbol(e.target.value)} value={selectedSymbol} className="p-2 bg-brand-surface border border-brand-surface-light rounded-lg text-sm"><option value="">All Symbols</option>{filterOptions.symbols.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
              <select onChange={(e) => setSelectedRare(e.target.value)} value={selectedRare} className="p-2 bg-brand-surface border border-brand-surface-light rounded-lg text-sm"><option value="">All Rares</option>{filterOptions.rares.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="only1" checked={showOnly1} onChange={(e) => setShowOnly1(e.target.checked)} className="h-4 w-4 bg-brand-surface border-brand-surface-light rounded" />
              <label htmlFor="only1" className="text-sm">Show Only#1 Cards</label>
            </div>
          </div>
          <div className="overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredCards.map((card, index) => {
                const count = getCardCount(card.RuleName);
                const lifeCount = deckCards.filter(c => c.Type?.toLowerCase().includes('life')).length;
                const hasOnly1 = deckCards.some(c => c.Ex?.toLowerCase().includes('only#1'));
                const isLifeCard = card.Type?.toLowerCase().includes('life');
                const isOnly1Card = card.Ex?.toLowerCase().includes('only#1');
                let isDisabled = deckCards.length >= 50;
                if (!isDisabled) {
                    if (isLifeCard && (lifeCount >= 5 || count > 0)) isDisabled = true;
                    if (isOnly1Card && hasOnly1) isDisabled = true;
                    if (!isLifeCard && !isOnly1Card && count >= 4) isDisabled = true;
                }
                return <CardDisplay key={`${card.RuleName}-${index}`} card={card} onCardClick={handleCardClick} isDisabled={isDisabled} />;
              })}
            </div>
          </div>
        </div>
        <div className="w-1/4 border-l border-brand-surface-light flex flex-col">
          <DeckList deckCards={deckCards} onRemoveCard={removeCard} getCardCount={getCardCount} onClearDeck={clearDeck} />
        </div>
      </div>
    </main>
  );
}