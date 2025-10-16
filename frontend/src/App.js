import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './App.css';

// --- ค่าคงที่สำหรับกฎของเกม ---
const MAIN_DECK_LIMIT = 50;
const LIFE_DECK_LIMIT = 5;
const DEFAULT_CARD_LIMIT = 4;

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainDeck, setMainDeck] = useState([]);
  const [lifeDeck, setLifeDeck] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  
  // --- NEW: State สำหรับควบคุมการแสดงผลของ Deck List ---
  const [isDeckListVisible, setIsDeckListVisible] = useState(true); // เริ่มต้นให้แสดง

  const [filters, setFilters] = useState({
    Type: [],
    Symbol: [],
    Cost: [],
    'C Color': [],
    Gem: [],
    'G Color': [],
  });

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/cards');
        const cleanedData = response.data.data.map(card => ({
          ...card,
          AllowedCopies: card.AllowedCopies === '' ? null : Number(card.AllowedCopies)
        }));
        setCards(cleanedData);
      } catch (error) {
        console.error("Error fetching card data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);
  
  const filterOptions = useMemo(() => {
    const options = {
      Type: new Set(),
      Symbol: new Set(),
      Cost: new Set(),
      'C Color': new Set(),
      Gem: new Set(),
      'G Color': new Set(),
    };
    cards.forEach(card => {
      Object.keys(options).forEach(key => {
        if (card[key] !== '' && card[key] !== undefined) {
          options[key].add(card[key]);
        }
      });
    });
    return {
      Type: Array.from(options.Type).sort(),
      Symbol: Array.from(options.Symbol).sort(),
      Cost: Array.from(options.Cost).sort((a, b) => a - b),
      'C Color': Array.from(options['C Color']).sort(),
      Gem: Array.from(options.Gem).sort((a, b) => a - b),
      'G Color': Array.from(options['G Color']).sort(),
    };
  }, [cards]);

  const handleFilterChange = (category, value) => {
    setFilters(prevFilters => {
      const currentValues = prevFilters[category];
      if (currentValues.includes(value)) {
        return { ...prevFilters, [category]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prevFilters, [category]: [...currentValues, value] };
      }
    });
  };

  const filteredCards = useMemo(() => {
    return cards
      .filter(card => 
        (card.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         card.RuleName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter(card => {
        return Object.entries(filters).every(([category, values]) => {
          if (values.length === 0) {
            return true;
          }
          return values.includes(card[category]);
        });
      });
  }, [cards, searchTerm, filters]);


const addCardToDeck = (cardToAdd) => {
    // ด่านตรวจที่ 0: ห้าม Life Card เข้า Main Deck
    const isLifeCard = cardToAdd.Name.includes('_Life') || cardToAdd.RuleName.includes('_Life');
    if (isLifeCard) {
      alert("การ์ดประเภท Life สามารถเพิ่มลงใน Life Deck ได้เท่านั้น (โดยการคลิกขวา)");
      return;
    }

    // --- REVISED: ด่านตรวจพิเศษสำหรับ "เมียพระอิศวร" (เช็คเฉพาะ Avatar) ---
    const MEAR_PRA_ISUAN_RULENAME = 'เมียพระอิศวร';
    const THEP_SYMBOL = 'เทพ';
    const AVATAR_TYPE = 'Avatar';

    // กรณีที่ 1: กำลังจะเพิ่ม "เมียพระอิศวร"
    if (cardToAdd.RuleName === MEAR_PRA_ISUAN_RULENAME) {
      // เช็คว่าในเด็คมี 'Avatar' ใบอื่นที่ไม่ใช่ Symbol 'เทพ' หรือไม่
      const hasNonThepAvatar = mainDeck.some(
        deckCard => deckCard.Type === AVATAR_TYPE && deckCard.Symbol !== THEP_SYMBOL
      );
      if (hasNonThepAvatar) {
        alert("ไม่สามารถเพิ่ม 'เมียพระอิศวร' ได้ เพราะในเด็คมี Avatar ที่ Symbol ไม่ใช่ 'เทพ' อยู่แล้ว");
        return;
      }
    }

    // กรณีที่ 2: ในเด็คมี "เมียพระอิศวร" อยู่แล้ว และกำลังจะเพิ่ม 'Avatar' ใบอื่น
    const deckHasMearPraIsuan = mainDeck.some(deckCard => deckCard.RuleName === MEAR_PRA_ISUAN_RULENAME);
    if (deckHasMearPraIsuan && cardToAdd.Type === AVATAR_TYPE) {
      // เช็คว่า 'Avatar' ที่กำลังจะเพิ่มเข้ามา มี Symbol เป็น 'เทพ' หรือไม่
      if (cardToAdd.Symbol !== THEP_SYMBOL) {
        alert("เด็คที่มี 'เมียพระอิศวร' สามารถเพิ่มได้เฉพาะ Avatar ที่มี Symbol 'เทพ' เท่านั้น");
        return;
      }
    }
    // --- สิ้นสุดด่านตรวจพิเศษ ---

    // ด่านตรวจอื่นๆ (เหมือนเดิม)
    const mainDeckTotal = mainDeck.reduce((total, card) => total + card.count, 0);
    const cardInDeck = mainDeck.find(card => card.RuleName === cardToAdd.RuleName);
    const currentCount = cardInDeck ? cardInDeck.count : 0;
    if (mainDeckTotal >= MAIN_DECK_LIMIT) {
      alert("Main Deck ของคุณเต็มแล้ว (50 ใบ)");
      return;
    }
    const limit = cardToAdd.AllowedCopies !== null ? cardToAdd.AllowedCopies : DEFAULT_CARD_LIMIT;
    if (limit === 0) {
      alert(`การ์ด "${cardToAdd.Name}" ถูกแบน ห้ามใส่ในเด็ค`);
      return;
    }
    if (currentCount >= limit) {
      alert(`ไม่สามารถเพิ่ม "${cardToAdd.Name}" ได้แล้ว ใส่ได้สูงสุด ${limit} ใบ`);
      return;
    }
    if (cardToAdd.is_only_one) {
      const hasOnlyOneCard = mainDeck.some(card => card.is_only_one);
      if (hasOnlyOneCard) {
        alert("คุณสามารถใส่การ์ดประเภท Only#1 ได้เพียงใบเดียวในเด็ค");
        return;
      }
    }
    if (cardToAdd.RestrictionTypeGroupID) {
        const groupType = cardToAdd.RestrictionTypeGroupID;
        const groupID = cardToAdd.GroupID;
        const hasConflict = mainDeck.some(
            (deckCard) => deckCard.GroupID === groupID && deckCard.RuleName !== cardToAdd.RuleName
        );
        if (hasConflict) {
            if (groupType === 'Choice' || groupType === 'Incompatible') {
                alert(`ไม่สามารถเพิ่ม "${cardToAdd.Name}" ได้ เพราะมีการ์ดอื่นจากกลุ่ม (${groupID}) อยู่ในเด็คแล้ว`);
                return;
            }
        }
    }
    setMainDeck(currentDeck => {
      const sortedDeck = [...currentDeck];
      const existingCardIndex = sortedDeck.findIndex(card => card.RuleName === cardToAdd.RuleName);

      if (existingCardIndex > -1) {
        sortedDeck[existingCardIndex].count++;
      } else {
        sortedDeck.push({ ...cardToAdd, count: 1 });
      }
      sortedDeck.sort((a, b) => {
        if (a.Type < b.Type) return -1;
        if (a.Type > b.Type) return 1;
        if (a.Name < b.Name) return -1;
        if (a.Name > b.Name) return 1;
        return 0;
      });
      return sortedDeck;
    });
  };

  const addCardToLifeDeck = (cardToAdd) => {
    const isLifeCard = cardToAdd.Name.includes('_Life') || cardToAdd.RuleName.includes('_Life');
    if (!isLifeCard) {
      alert(`การ์ด "${cardToAdd.Name}" ไม่ใช่ Life Card จึงไม่สามารถเพิ่มลงใน Life Deck ได้`);
      return;
    }
    if (lifeDeck.length >= LIFE_DECK_LIMIT) {
      alert("Life Deck ของคุณเต็มแล้ว (5 ใบ)");
      return;
    }
    const isDuplicate = lifeDeck.some(card => card.RuleName === cardToAdd.RuleName);
    if (isDuplicate) {
      alert(`การ์ด "${cardToAdd.Name}" มีอยู่ใน Life Deck แล้ว (กฎ Life Deck ห้ามชื่อซ้ำ)`);
      return;
    }
    setLifeDeck(currentLifeDeck => [...currentLifeDeck, cardToAdd]);
  };
  
  const removeCardFromMainDeck = (cardToRemove) => {
    setMainDeck(currentDeck => {
      const cardInDeck = currentDeck.find(card => card.RuleName === cardToRemove.RuleName);
      if (cardInDeck.count > 1) {
        return currentDeck.map(card => 
          card.RuleName === cardToRemove.RuleName 
            ? { ...card, count: card.count - 1 } 
            : card
        );
      } else {
        return currentDeck.filter(card => card.RuleName !== cardToRemove.RuleName);
      }
    });
  };

  const removeCardFromLifeDeck = (cardToRemove) => {
    setLifeDeck(currentLifeDeck => 
      currentLifeDeck.filter(card => card.RuleName !== cardToRemove.RuleName)
    );
  };
  
  const clearAllDecks = () => {
    if (window.confirm("คุณต้องการล้างเด็คทั้งหมดใช่หรือไม่?")) {
      setMainDeck([]);
      setLifeDeck([]);
    }
  };

  const mainDeckTotal = mainDeck.reduce((total, card) => total + card.count, 0);
  
  const renderGroupedDeck = () => {
    const grouped = mainDeck.reduce((acc, card) => {
      if (card.is_only_one) {
        if (!acc['Only#1']) acc['Only#1'] = [];
        acc['Only#1'].push(card);
        return acc;
      }
      const type = card.Type || 'Other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(card);
      return acc;
    }, {});

    const groupOrder = ['Only#1', 'Avatar', 'Magic', 'Construct'];

    return groupOrder.map(groupName => {
      if (!grouped[groupName] || grouped[groupName].length === 0) return null;
      
      const groupTotal = grouped[groupName].reduce((total, card) => total + card.count, 0);

      return (
        <div key={groupName} className="deck-card-group">
          <h4 className="group-header">{groupName} ({groupTotal})</h4>
          {grouped[groupName].map((card, index) => (
            <div key={`${card.RuleName}-${index}`} className="deck-card-item">
              {card.image_url && <img src={card.image_url} alt={card.Name} className="deck-card-thumbnail" />}
              <span className="deck-card-count">x{card.count}</span>
              <span className="deck-card-name">{card.Name}</span>
              <button onClick={() => removeCardFromMainDeck(card)} className="delete-card-btn">
                🗑️
              </button>
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <div className="app-container">
      <div className="main-content">
        
        <div className={`filter-wrapper ${isFilterVisible ? 'visible' : 'hidden'}`}>
            <h2 className="filter-main-title">Filter Options</h2>
            <div className="filter-panel">
            {Object.entries(filterOptions).map(([category, options]) => (
              <div key={category} className="filter-group">
                <h3 className="filter-title">{category}</h3>
                <div className="filter-options">
                  {options.map(option => (
                    <label key={option} className="filter-label">
                      <input
                        type="checkbox"
                        checked={filters[category].includes(option)}
                        onChange={() => handleFilterChange(category, option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-gallery-wrapper">
          <header className="app-header">
            <button 
              className="filter-toggle-btn" 
              onClick={() => setIsFilterVisible(!isFilterVisible)}
            >
              {isFilterVisible ? '❮' : '❯'}
            </button>
            <h1>Battle of Talingchan Deck Builder</h1>
            <input
              type="text"
              placeholder="ค้นหาการ์ดด้วยชื่อ..."
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </header>
          
          <main className="card-gallery">
            {loading ? <p>Loading cards...</p> : (
              filteredCards.map((card, index) => (
                <div 
                  key={`${card.RuleName}-${index}`} 
                  className="card-container" 
                  onClick={() => addCardToDeck(card)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    addCardToLifeDeck(card);
                  }}
                >
                  <img src={card.image_url} alt={card.Name} className="card-image" />
                </div>
              ))
            )}
          </main>
        </div>

        {/* ---- REVISED: คอลัมน์ที่ 3: Deck List ---- */}
        <div className={`deck-list-wrapper ${isDeckListVisible ? 'visible' : 'hidden'}`}>
          {/* --- NEW: ปุ่มสำหรับเปิด/ปิด Deck List --- */}
          <button 
            className="decklist-toggle-btn" 
            onClick={() => setIsDeckListVisible(!isDeckListVisible)}
          >
            {isDeckListVisible ? '❯' : '❮'}
          </button>

          <div className="deck-actions">
            <button onClick={clearAllDecks} className="clear-deck-btn">
              Clear All 🗑️
            </button>
          </div>
          
          <div className="deck-section">
            <div className="deck-header">Main Deck ({mainDeckTotal} / {MAIN_DECK_LIMIT})</div>
            <div className="deck-card-list">
              {renderGroupedDeck()}
            </div>
          </div>
          
          <div className="deck-section">
            <div className="deck-header">Life Deck ({lifeDeck.length} / {LIFE_DECK_LIMIT})</div>
            <div className="deck-card-list">
              {lifeDeck.map((card, index) => (
                <div key={`${card.RuleName}-${index}`} className="deck-card-item">
                  {card.image_url && <img src={card.image_url} alt={card.Name} className="deck-card-thumbnail" />}
                  <span className="deck-card-count">x1</span>
                  <span className="deck-card-name">{card.Name}</span>
                  <button onClick={() => removeCardFromLifeDeck(card)} className="delete-card-btn">
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;