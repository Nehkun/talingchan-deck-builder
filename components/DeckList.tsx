// /components/DeckList.tsx
import { Card } from "@/lib/googleSheets";
import Image from "next/image";
import Link from "next/link";
import { useDeckStore } from "@/store/deckStore";

const CardCategory = ({ title, cards, onRemoveCard, getCardCount }: { title: string; cards: Card[]; onRemoveCard: (ruleName: string) => void; getCardCount: (ruleName: string) => number; }) => {
  if (cards.length === 0) return null;
  const sortedCards = [...cards].sort((a, b) => a.Name.localeCompare(b.Name));
  const totalInCategory = cards.reduce((sum, card) => sum + getCardCount(card.RuleName), 0);
  return (
    <div>
      <h3 className="text-sm font-bold text-brand-primary bg-brand-surface-light px-2 py-1 sticky top-0">{title} ({totalInCategory})</h3>
      <ul>
        {sortedCards.map(card => (
          <li key={card.RuleName} className="flex justify-between items-center p-2 border-b border-brand-surface-light hover:bg-brand-surface-light">
            <div className="flex items-center">
              {card.Image && <Image src={card.Image} alt={card.Name} width={30} height={42} className="rounded-sm" />}
              <span className={`text-sm ${card.Image ? 'ml-2' : ''}`}>{card.Name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">x{getCardCount(card.RuleName)}</span>
              <button onClick={() => onRemoveCard(card.RuleName)} className="bg-brand-danger text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:opacity-80">-</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function DeckList({ deckCards, onRemoveCard, getCardCount, onClearDeck }: {
  deckCards: Card[];
  onRemoveCard: (ruleName: string) => void;
  getCardCount: (ruleName: string) => number;
  onClearDeck: () => void;
}) {
  const { playerName, deckName, setPlayerName, setDeckName } = useDeckStore();
  const uniqueCards = deckCards.reduce((acc, current) => { if (!acc.find(item => item.RuleName === current.RuleName)) { acc.push(current); } return acc; }, [] as Card[]);
  const only1Card = uniqueCards.find(c => c.Ex?.toLowerCase().includes('only#1'));
  const avatarCards = uniqueCards.filter(c => c.Type === 'Avatar' && !c.Ex?.toLowerCase().includes('only#1'));
  const magicCards = uniqueCards.filter(c => c.Type === 'Magic');
  const constructCards = uniqueCards.filter(c => c.Type === 'Construct');
  const lifeCards = uniqueCards.filter(c => c.Type?.toLowerCase().includes('life'));
  const totalCards = deckCards.length;
  const lifeCardCount = deckCards.filter(c => c.Type?.toLowerCase().includes('life')).length;
  const hasOnly1 = deckCards.some(c => c.Ex?.toLowerCase().includes('only#1'));
  const deckErrors: string[] = [];
  if (totalCards !== 50) deckErrors.push(`- Deck must have 50 cards (${totalCards}/50)`);
  if (lifeCardCount !== 5) deckErrors.push(`- Must have 5 Life cards (${lifeCardCount}/5)`);
  if (!hasOnly1) deckErrors.push("- Missing an 'Only#1' card");
  const isDeckValid = deckErrors.length === 0;
  const handleClearDeck = () => { if (window.confirm("Are you sure?")) { onClearDeck(); } };
  const progressPercentage = Math.min((totalCards / 50) * 100, 100);

  return (
    <div className="bg-brand-surface h-full flex flex-col">
      <div className="p-4 border-b border-brand-surface-light">
        <div className="flex justify-between items-center"><h2 className="text-xl font-bold">Your Deck</h2>{deckCards.length > 0 && <button onClick={handleClearDeck} className="bg-brand-danger text-white text-xs px-2 py-1 rounded hover:opacity-80">Clear All</button>}</div>
        <p className={`text-lg font-semibold ${totalCards === 50 ? 'text-green-400' : 'text-brand-primary'}`}>{totalCards} / 50 Cards</p>
        <div className="w-full bg-brand-surface-light rounded-full h-2 mt-2"><div className="bg-brand-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div></div>
      </div>
      <div className="p-4 border-b border-brand-surface-light space-y-2">
        <input type="text" placeholder="Player Name" className="w-full p-2 bg-brand-bg border border-brand-surface-light rounded-md text-sm" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
        <input type="text" placeholder="Deck Name" className="w-full p-2 bg-brand-bg border border-brand-surface-light rounded-md text-sm" value={deckName} onChange={(e) => setDeckName(e.target.value)} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {uniqueCards.length === 0 ? <p className="p-4 text-gray-400">Click a card to add it.</p> : <div>{only1Card && <CardCategory title="Only#1" cards={[only1Card]} onRemoveCard={onRemoveCard} getCardCount={getCardCount} />} <CardCategory title="Avatar" cards={avatarCards} onRemoveCard={onRemoveCard} getCardCount={getCardCount} /> <CardCategory title="Magic" cards={magicCards} onRemoveCard={onRemoveCard} getCardCount={getCardCount} /> <CardCategory title="Construct" cards={constructCards} onRemoveCard={onRemoveCard} getCardCount={getCardCount} /> <CardCategory title="Life" cards={lifeCards} onRemoveCard={onRemoveCard} getCardCount={getCardCount} /></div>}
      </div>
      <div className="p-4 border-t border-brand-surface-light mt-auto bg-brand-bg">
        <h3 className="font-bold mb-2">Deck Status</h3>
        {deckErrors.length > 0 ? <div className="text-brand-danger text-sm space-y-1">{deckErrors.map(error => <p key={error}>{error}</p>)}</div> : <p className="text-green-400 text-sm font-semibold">✅ Deck is valid!</p>}
        <Link href="/print" legacyBehavior><a className={`w-full text-center block mt-4 p-2 rounded font-bold ${isDeckValid ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`} onClick={(e) => !isDeckValid && e.preventDefault()}>Generate Printable Deck List</a></Link>
      </div>
    </div>
  );
}