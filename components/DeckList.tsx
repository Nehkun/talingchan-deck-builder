// /components/DeckList.tsx
import { Card } from "@/lib/googleSheets";
import Image from "next/image";
import Link from "next/link";
import { useDeckStore } from "@/store/deckStore";

const CardCategory = ({ title, cards, onRemoveCard, getCardCount }: {
  title: string;
  cards: Card[];
  onRemoveCard: (ruleName: string) => void;
  getCardCount: (ruleName: string) => number;
}) => {
  if (cards.length === 0) return null;
  const sortedCards = [...cards].sort((a, b) => a.Name.localeCompare(b.Name));
  const totalInCategory = cards.reduce((sum, card) => sum + getCardCount(card.RuleName), 0);
  return (
    <div>
      <h3 className="text-sm font-bold text-accent-primary bg-dark-bg/50 px-3 py-1.5 sticky top-0 z-10">{title} ({totalInCategory})</h3>
      <ul>{sortedCards.map(card => (
        <li key={card.RuleName} className="flex justify-between items-center px-3 py-2 border-b border-dark-border hover:bg-dark-border/50">
          <div className="flex items-center min-w-0"><div className="flex-shrink-0">{card.Image && <Image src={card.Image} alt={card.Name} width={30} height={42} className="rounded-sm" />}</div><span className={`text-sm truncate ${card.Image ? 'ml-3' : ''}`}>{card.Name}</span></div>
          <div className="flex items-center gap-3 flex-shrink-0"><span className="text-sm font-bold w-6 text-center">x{getCardCount(card.RuleName)}</span><button onClick={() => onRemoveCard(card.RuleName)} className="bg-card-border text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:opacity-80 transition-opacity">-</button></div>
        </li>
      ))}</ul>
    </div>
  );
};

export default function DeckList({ deckCards, onRemoveCard, getCardCount, onClearDeck }: {
  deckCards: Card[]; onRemoveCard: (ruleName: string) => void; getCardCount: (ruleName: string) => number; onClearDeck: () => void;
}) {
  const { playerName, deckName, setPlayerName, setDeckName } = useDeckStore();
  const uniqueCards = deckCards.reduce((acc, current) => { if (!acc.find(item => item.RuleName === current.RuleName)) acc.push(current); return acc; }, [] as Card[]);
  const only1Card = uniqueCards.find(c => c.Ex?.toLowerCase().includes('only#1'));
  const avatarCards = uniqueCards.filter(c => c.Type === 'Avatar' && !c.Ex?.toLowerCase().includes('only#1'));
  const magicCards = uniqueCards.filter(c => c.Type === 'Magic');
  const constructCards = uniqueCards.filter(c => c.Type === 'Construct');
  const lifeCards = uniqueCards.filter(c => c.Type?.toLowerCase().includes('life'));
  const mainDeckCards = deckCards.filter(c => !c.Type?.toLowerCase().includes('life'));
  const mainDeckCount = mainDeckCards.length;
  const lifeCardCount = deckCards.length - mainDeckCount;
  const hasOnly1 = mainDeckCards.some(c => c.Ex?.toLowerCase().includes('only#1'));
  const deckErrors: string[] = [];
  if (mainDeckCount !== 50) deckErrors.push(`- Main Deck must have 50 cards (${mainDeckCount}/50)`);
  if (lifeCardCount !== 5) deckErrors.push(`- Must have 5 Life cards (${lifeCardCount}/5)`);
  if (!hasOnly1) deckErrors.push("- Missing an 'Only#1' card from Main Deck");
  const isDeckValid = deckErrors.length === 0;

  return (
    <div className="bg-dark-surface h-full flex flex-col">
      <header className="p-4">
        <div className="flex justify-between items-center mb-2"><h2 className="text-xl font-bold">Your Deck</h2>{deckCards.length > 0 && <button onClick={onClearDeck} className="text-xs text-text-muted hover:text-card-border">Clear All</button>}</div>
        <div className="space-y-1 text-sm">
          <p className={`font-semibold ${mainDeckCount === 50 ? 'text-green-400' : 'text-accent-primary'}`}>Main Deck: {mainDeckCount} / 50</p>
          <p className={`font-semibold ${lifeCardCount === 5 ? 'text-green-400' : 'text-accent-primary'}`}>Life Cards: {lifeCardCount} / 5</p>
        </div>
      </header>
      <section className="p-4 space-y-2 border-y border-dark-border">
        <input type="text" placeholder="Player Name" className="w-full p-2 bg-dark-bg border border-dark-border rounded-md text-sm placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
        <input type="text" placeholder="Deck Name" className="w-full p-2 bg-dark-bg border border-dark-border rounded-md text-sm placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary" value={deckName} onChange={(e) => setDeckName(e.target.value)} />
      </section>
      <div className="flex-1 overflow-y-auto">{uniqueCards.length === 0 ? <p className="p-4 text-text-muted text-center mt-4">Click a card to add it.</p> : <div>{only1Card && <CardCategory title="Only#1" cards={[only1Card]} onRemoveCard={onRemoveCard} getCardCount={getCardCount} />} <CardCategory title="Avatar" cards={avatarCards} onRemoveCard={onRemoveCard} getCardCount={getCardCount} /> <CardCategory title="Magic" cards={magicCards} onRemoveCard={onRemoveCard} getCardCount={getCardCount} /> <CardCategory title="Construct" cards={constructCards} onRemoveCard={onRemoveCard} getCardCount={getCardCount} /> <CardCategory title="Life" cards={lifeCards} onRemoveCard={onRemoveCard} getCardCount={getCardCount} /></div>}</div>
      
      {/* --- ✨ ส่วนของปุ่ม "View Deck" และ "Print" อยู่ที่นี่ --- */}
      <footer className="p-4 border-t border-dark-border mt-auto bg-dark-bg">
        <h3 className="font-bold mb-2">Deck Status</h3>
        {deckErrors.length > 0 ? <div className="text-card-border text-sm space-y-1">{deckErrors.map(error => <p key={error}>{error}</p>)}</div> : <p className="text-green-400 text-sm font-semibold">✅ Deck is valid!</p>}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Link href="/view" legacyBehavior>
            <a className={`w-full text-center block p-2 rounded-md font-bold transition-colors ${deckCards.length > 0 ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-dark-border text-text-muted cursor-not-allowed'}`}
               onClick={(e) => deckCards.length === 0 && e.preventDefault()}
            >
              View Deck
            </a>
          </Link>
          <Link href="/print" legacyBehavior>
            <a className={`w-full text-center block p-2 rounded-md font-bold transition-colors ${isDeckValid ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-dark-border text-text-muted cursor-not-allowed'}`}
               onClick={(e) => !isDeckValid && e.preventDefault()}
            >
              Print List
            </a>
          </Link>
        </div>
      </footer>
    </div>
  );
}