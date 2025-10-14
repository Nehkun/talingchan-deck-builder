// /store/deckStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Card } from '@/lib/googleSheets';
import toast from 'react-hot-toast';

interface BanlistEntry { RuleName: string; AllowedCopies: number; }
interface DeckState {
  cards: Card[];
  playerName: string; deckName: string;
  setPlayerName: (name: string) => void; setDeckName: (name: string) => void;
  addCard: (card: Card, banlist: BanlistEntry[]) => void;
  removeCard: (ruleName: string) => void;
  getCardCount: (ruleName: string) => number;
  clearDeck: () => void;
}

export const useDeckStore = create(
  persist<DeckState>(
    (set, get) => ({
      cards: [],
      playerName: "", deckName: "",
      setPlayerName: (name) => set({ playerName: name }),
      setDeckName: (name) => set({ deckName: name }),
      
      addCard: (cardToAdd, banlist) => {
        const { cards, getCardCount } = get();

        if (cards.length >= 50) {
          toast.error("Your deck is full (50 cards maximum).");
          return;
        }

        const banlistEntry = banlist.find(entry => entry.RuleName === cardToAdd.RuleName);
        if (banlistEntry) {
          const currentCount = getCardCount(cardToAdd.RuleName);
          if (currentCount >= banlistEntry.AllowedCopies) {
            toast.error(banlistEntry.AllowedCopies === 0 ? `'${cardToAdd.Name}' is banned.` : `Limited to ${banlistEntry.AllowedCopies} copy/copies.`);
            return;
          }
        }

        const isLifeCard = cardToAdd.Type?.toLowerCase().includes('life');
        const isOnly1Card = cardToAdd.Ex?.toLowerCase().includes('only#1');

        if (isLifeCard) {
          if (cards.some(c => c.Type?.toLowerCase().includes('life') && c.RuleName === cardToAdd.RuleName)) {
            toast.error("You cannot have duplicate Life cards.");
            return;
          }
          if (cards.filter(c => c.Type?.toLowerCase().includes('life')).length >= 5) {
            toast.error("You cannot have more than 5 Life cards.");
            return;
          }
        }

        if (isOnly1Card) {
          if (cards.some(c => c.Ex?.toLowerCase().includes('only#1'))) {
            toast.error("You can only have one 'Only#1' card.");
            return;
          }
        } else if (!isLifeCard) {
          if (getCardCount(cardToAdd.RuleName) >= 4) {
            toast.error(`Limited to 4 copies of ${cardToAdd.Name}.`);
            return;
          }
        }

        set((state) => ({ cards: [...state.cards, cardToAdd] }));
        toast.success(`Added ${cardToAdd.Name}`);
      },
      
      removeCard: (ruleNameToRemove) => {
        const cardName = get().cards.find(c => c.RuleName === ruleNameToRemove)?.Name || ruleNameToRemove;
        set((state) => {
          const cardIndex = state.cards.map(c => c.RuleName).lastIndexOf(ruleNameToRemove);
          if (cardIndex > -1) {
            const newCards = [...state.cards];
            newCards.splice(cardIndex, 1);
            return { cards: newCards };
          }
          return state;
        });
        toast.error(`Removed ${cardName}`);
      },

      getCardCount: (ruleName) => get().cards.filter(c => c.RuleName === ruleName).length,
      
      clearDeck: () => {
        set({ cards: [], playerName: "", deckName: "" });
        toast('Deck cleared!', { icon: '🗑️' });
      },
    }),
    { name: 'talingchan-deck-storage', storage: createJSONStorage(() => localStorage) }
  )
);