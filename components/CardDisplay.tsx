// /components/CardDisplay.tsx
import { Card } from "@/lib/googleSheets";
import Image from "next/image";

interface CardDisplayProps {
  card: Card;
  onCardClick: (card: Card) => void;
  isDisabled: boolean;
}

export default function CardDisplay({ card, onCardClick, isDisabled }: CardDisplayProps) {
  const isLifeCard = card.Type?.toLowerCase().includes('life');
  const isOnly1Card = card.Ex?.toLowerCase().includes('only#1');

  return (
    <div
      onClick={() => !isDisabled && onCardClick(card)}
      className={`relative border rounded-lg flex flex-col bg-brand-surface border-brand-surface-light transition-all duration-150 
        ${isDisabled 
          ? 'opacity-40 cursor-not-allowed' 
          : 'cursor-pointer hover:border-brand-primary hover:scale-105'
        }`}
      title={isDisabled ? "Cannot add this card" : card.Name}
    >
      {card.Image ? (
        <Image src={card.Image} alt={card.Name} width={300} height={420} className="rounded-lg object-cover" />
      ) : (
        <div className="p-3 text-white">
          {isLifeCard ? (
            <div className="flex-grow flex items-center justify-center min-h-[150px]">
              <p className="font-bold text-lg text-center text-brand-secondary">{card.Name}</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-1 h-full">
              {isOnly1Card && <span className="absolute top-1 right-1 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">Only#1</span>}
              <p className="font-bold text-base text-center border-b border-brand-surface-light pb-1">{card.Name}</p>
              <p className="text-xs text-gray-300"><span className="font-semibold">Type:</span> {card.Type} / {card.Symbol}</p>
              <p className="text-xs text-gray-300"><span className="font-semibold">Cost:</span> {card.Cost} ({card.CColor})</p>
              <p className="text-xs text-gray-300"><span className="font-semibold">Gem:</span> {card.Gem} ({card.GColor})</p>
              <p className="text-xs text-brand-danger"><span className="font-semibold">Power:</span> {card.Power}</p>
              <p className="text-right font-bold text-brand-primary text-xs mt-auto pt-1">{card.Rare}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}