import { CardItem, CardType, GameModeId, IntensityLevel, Player } from '../types';
import { FULL_DATABASE, selectCompatiblePartner } from '../data/questions';

const STORAGE_KEY_CUSTOM_CARDS = 'av_app_custom_cards_v3';
const STORAGE_KEY_CARD_OVERRIDES = 'av_app_card_overrides_v3';
const STORAGE_KEY_REPORTED_CARDS = 'av_app_reported_cards_v3';

export interface SelectionOptions {
  type: CardType;
  mode?: GameModeId;
  intensity?: IntensityLevel;
  categories?: ('soft' | 'hot' | 'extreme')[];
  minDifficulty?: number;
  maxDifficulty?: number;
  progressiveDifficulty?: boolean;
  currentRound?: number;
  groupMinAge?: '13+' | '16+' | '18+';
  currentPlayer: Player;
  allPlayers: Player[];
  playedCardIds: (string | number)[];
  lastTags?: string[];
}

export interface SelectionResult {
  status: 'success' | 'no_cards_left' | 'no_matching_filter';
  card?: CardItem;
  remainingCount: number;
  totalPoolCount: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImportPreviewResult {
  validCards: CardItem[];
  invalidCards: { raw: any; reason: string }[];
  duplicateCount: number;
  conflicts: { existing: CardItem; incoming: CardItem }[];
}

class CardEngine {
  private customCards: CardItem[] = [];
  private cardOverrides: Record<string | number, Partial<CardItem>> = {};
  private reportedCardIds: Set<string | number> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  // --- PERSISTENCE ---
  private loadFromStorage() {
    try {
      const savedCustom = localStorage.getItem(STORAGE_KEY_CUSTOM_CARDS);
      if (savedCustom) {
        this.customCards = JSON.parse(savedCustom);
      }
    } catch (e) {
      console.error('Error loading custom cards', e);
      this.customCards = [];
    }

    try {
      const savedOverrides = localStorage.getItem(STORAGE_KEY_CARD_OVERRIDES);
      if (savedOverrides) {
        this.cardOverrides = JSON.parse(savedOverrides);
      }
    } catch (e) {
      console.error('Error loading card overrides', e);
      this.cardOverrides = {};
    }

    try {
      const savedReported = localStorage.getItem(STORAGE_KEY_REPORTED_CARDS);
      if (savedReported) {
        const arr = JSON.parse(savedReported);
        this.reportedCardIds = new Set(arr);
      }
    } catch (e) {
      this.reportedCardIds = new Set();
    }
  }

  private saveCustomCards() {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_CARDS, JSON.stringify(this.customCards));
    } catch (e) {
      console.error('Error saving custom cards', e);
    }
  }

  private saveCardOverrides() {
    try {
      localStorage.setItem(STORAGE_KEY_CARD_OVERRIDES, JSON.stringify(this.cardOverrides));
    } catch (e) {
      console.error('Error saving card overrides', e);
    }
  }

  private saveReportedCards() {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTED_CARDS, JSON.stringify(Array.from(this.reportedCardIds)));
    } catch (e) {
      console.error('Error saving reported cards', e);
    }
  }

  // --- GET ALL UNIFIED CARDS ---
  public getAllCards(): CardItem[] {
    const unifiedMap = new Map<string | number, CardItem>();

    // 1. Add official base cards
    FULL_DATABASE.forEach((c) => {
      const copy: CardItem = {
        enabled: true,
        weight: 1,
        difficulty: c.difficulty || 1,
        category: c.category || 'soft',
        age_rating: c.age_rating as any || '13+',
        tags: c.tags || [],
        created_at: new Date(1700000000000).toISOString(),
        updated_at: new Date(1700000000000).toISOString(),
        ...c,
      };
      unifiedMap.set(c.id, copy);
    });

    // 2. Add custom cards
    this.customCards.forEach((c) => {
      unifiedMap.set(c.id, {
        enabled: true,
        weight: 1,
        difficulty: c.difficulty || 1,
        category: c.category || 'soft',
        age_rating: c.age_rating as any || '13+',
        tags: c.tags || [],
        custom: true,
        ...c,
      });
    });

    // 3. Apply overrides & reported status
    const result: CardItem[] = [];
    unifiedMap.forEach((card, id) => {
      const override = this.cardOverrides[id] || {};
      const isReported = this.reportedCardIds.has(id);
      result.push({
        ...card,
        ...override,
        reported: isReported || card.reported || false,
      });
    });

    return result;
  }

  // --- CARD SELECTION ENGINE ---
  public selectCard(options: SelectionOptions): SelectionResult {
    const allCards = this.getAllCards();

    // Age rating compatibility check
    const isAgeAllowed = (cardAge?: string): boolean => {
      const groupAge = options.groupMinAge || '18+';
      if (groupAge === '13+') return cardAge === '13+' || !cardAge;
      if (groupAge === '16+') return cardAge === '13+' || cardAge === '16+' || !cardAge;
      return true; // 18+ allows everything
    };

    // Determine target difficulty range
    let minDiff = options.minDifficulty || 1;
    let maxDiff = options.maxDifficulty || 5;

    if (options.progressiveDifficulty && options.currentRound) {
      const r = options.currentRound;
      if (r <= 3) {
        minDiff = 1;
        maxDiff = 2;
      } else if (r <= 7) {
        minDiff = 2;
        maxDiff = 3;
      } else if (r <= 12) {
        minDiff = 3;
        maxDiff = 4;
      } else {
        minDiff = 4;
        maxDiff = 5;
      }
    }

    // Filter Step 1: Base criteria (type, enabled, reported, age, difficulty)
    const basePool = allCards.filter((c) => {
      if (c.type !== options.type) return false;
      if (c.enabled === false) return false;
      if (c.reported === true) return false;
      if (!isAgeAllowed(c.age_rating)) return false;

      const diff = c.difficulty || 1;
      if (diff < minDiff || diff > maxDiff) return false;

      // Category matching
      if (options.categories && options.categories.length > 0) {
        if (!c.category || !options.categories.includes(c.category)) return false;
      } else if (options.intensity) {
        if (c.intensity && c.intensity !== options.intensity) {
          // Relax constraint slightly if intensity matches
        }
      }

      return true;
    });

    if (basePool.length === 0) {
      // Fallback: relax category / difficulty filter if pool is strictly empty
      const relaxedPool = allCards.filter((c) => {
        if (c.type !== options.type) return false;
        if (c.enabled === false) return false;
        if (c.reported === true) return false;
        if (!isAgeAllowed(c.age_rating)) return false;
        return true;
      });

      if (relaxedPool.length === 0) {
        return { status: 'no_matching_filter', remainingCount: 0, totalPoolCount: 0 };
      }
      return this.pickWeightedCard(relaxedPool, options);
    }

    // Filter Step 2: Anti-repetition (exclude played cards in current session)
    const unplayedPool = basePool.filter((c) => !options.playedCardIds.includes(c.id));

    if (unplayedPool.length === 0) {
      // All compatible cards in this configuration have been played!
      return {
        status: 'no_cards_left',
        remainingCount: 0,
        totalPoolCount: basePool.length,
      };
    }

    return this.pickWeightedCard(unplayedPool, options, basePool.length);
  }

  private pickWeightedCard(
    candidates: CardItem[],
    options: SelectionOptions,
    totalPoolSize: number = candidates.length
  ): SelectionResult {
    const lastTags = options.lastTags || [];

    // Calculate dynamic weights for weighted selection
    const weightedItems = candidates.map((card) => {
      let weight = card.weight ?? 1;
      if (weight <= 0) weight = 1;

      // Anti-consecutive-tag penalty
      if (card.tags && card.tags.length > 0 && lastTags.length > 0) {
        const tagOverlap = card.tags.filter((t) => lastTags.includes(t.toLowerCase())).length;
        if (tagOverlap > 0) {
          weight = Math.max(0.2, weight / (1 + tagOverlap * 1.5));
        }
      }

      return { card, weight };
    });

    const totalWeight = weightedItems.reduce((acc, item) => acc + item.weight, 0);
    let rand = Math.random() * totalWeight;

    let chosenCard = weightedItems[0].card;
    for (const item of weightedItems) {
      if (rand < item.weight) {
        chosenCard = item.card;
        break;
      }
      rand -= item.weight;
    }

    // Process variables in card text
    const processedCard = this.interpolateCardVariables(
      chosenCard,
      options.currentPlayer,
      options.allPlayers,
      options.mode || 'amis'
    );

    return {
      status: 'success',
      card: processedCard,
      remainingCount: candidates.length,
      totalPoolCount: totalPoolSize,
    };
  }

  // --- VARIABLE INTERPOLATION ENGINE ---
  public interpolateCardVariables(
    rawCard: CardItem,
    currentPlayer: Player,
    allPlayers: Player[],
    mode: GameModeId
  ): CardItem {
    let text = rawCard.text || '';
    let targetPartner: Player | undefined;

    // 1. Replace active player placeholder {{player}} or {player}
    text = text
      .replace(/\{\{player\}\}/gi, `**${currentPlayer.name}**`)
      .replace(/\{player\}/gi, `**${currentPlayer.name}**`);

    // 2. Select target partner player if target placeholder is present or card requires target
    const hasTargetPlaceholder =
      /\{\{target\}\}|\{target\}|\{PARTENAIRE\}|la personne de ton choix|une personne volontaire|une personne de ton choix|un autre joueur/gi.test(
        text
      );

    if (allPlayers.length > 1) {
      const candidatePartner = selectCompatiblePartner(currentPlayer, allPlayers, mode);
      if (candidatePartner) {
        targetPartner = candidatePartner;
        const targetFormatted = `**${candidatePartner.name}**`;

        text = text
          .replace(/\{\{target\}\}/gi, targetFormatted)
          .replace(/\{target\}/gi, targetFormatted)
          .replace(/\{PARTENAIRE\}/gi, targetFormatted)
          .replace(/la personne de ton choix/gi, targetFormatted)
          .replace(/une personne volontaire/gi, targetFormatted)
          .replace(/une personne de ton choix/gi, targetFormatted);
      }
    }

    // Fallback target cleanup if solo or no target available
    text = text
      .replace(/\{\{target\}\}/gi, 'un autre joueur')
      .replace(/\{target\}/gi, 'un autre joueur')
      .replace(/\{PARTENAIRE\}/gi, 'un autre joueur')
      .replace(/la personne de ton choix/gi, 'un autre joueur')
      .replace(/une personne volontaire/gi, 'un autre joueur');

    // 3. Replace category placeholder
    const catName = rawCard.category === 'hot' ? 'Hot 🌶️' : rawCard.category === 'extreme' ? 'Extrême 💀' : 'Soft 🟢';
    text = text
      .replace(/\{\{category\}\}/gi, catName)
      .replace(/\{category\}/gi, catName);

    return {
      ...rawCard,
      text,
      targetPartner,
    };
  }

  // --- CARD VALIDATION ENGINE ---
  public validateCard(card: Partial<CardItem>, existingCards: CardItem[] = this.getAllCards()): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!card.text || !card.text.trim()) {
      errors.push('Le texte de la carte ne peut pas être vide.');
    } else if (card.text.trim().length < 5) {
      warnings.push('Le texte est très court.');
    }

    if (!card.type || (card.type !== 'truth' && card.type !== 'dare')) {
      errors.push('Le type doit être "truth" (Vérité) ou "dare" (Action).');
    }

    if (!card.category || !['soft', 'hot', 'extreme'].includes(card.category)) {
      errors.push('La catégorie doit être "soft", "hot" ou "extreme".');
    }

    const diff = Number(card.difficulty);
    if (isNaN(diff) || diff < 1 || diff > 5) {
      errors.push('La difficulté doit être un entier entre 1 et 5.');
    }

    if (!card.age_rating || !['13+', '16+', '18+'].includes(card.age_rating)) {
      errors.push("L'âge minimum doit être '13+', '16+' ou '18+'.");
    }

    if (card.category === 'hot' && card.age_rating === '13+') {
      warnings.push("Une carte de catégorie 'Hot' est généralement conseillée pour 16+ ou 18+.");
    }

    // Check duplicate text
    if (card.text) {
      const normalizedNew = card.text.trim().toLowerCase();
      const duplicate = existingCards.find(
        (c) => c.id !== card.id && c.type === card.type && c.text.trim().toLowerCase() === normalizedNew
      );
      if (duplicate) {
        errors.push(`Une carte identique existe déjà (ID: ${duplicate.id}).`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // --- CRUD OPERATIONS ---
  public addCard(card: CardItem): ValidationResult {
    const validation = this.validateCard(card);
    if (!validation.isValid) return validation;

    const newCard: CardItem = {
      ...card,
      id: card.id || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      enabled: card.enabled !== undefined ? card.enabled : true,
      weight: card.weight || 1,
      custom: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.customCards.push(newCard);
    this.saveCustomCards();
    return validation;
  }

  public updateCard(id: string | number, updates: Partial<CardItem>): ValidationResult {
    const all = this.getAllCards();
    const existing = all.find((c) => String(c.id) === String(id));
    if (!existing) {
      return { isValid: false, errors: ['Carte introuvable.'], warnings: [] };
    }

    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    const validation = this.validateCard(updated, all);
    if (!validation.isValid) return validation;

    if (existing.custom) {
      this.customCards = this.customCards.map((c) => (String(c.id) === String(id) ? updated : c));
      this.saveCustomCards();
    } else {
      // Set override for official card
      this.cardOverrides[id] = {
        ...this.cardOverrides[id],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.saveCardOverrides();
    }

    return validation;
  }

  public deleteCard(id: string | number) {
    // If custom, remove from custom list
    this.customCards = this.customCards.filter((c) => String(c.id) !== String(id));
    this.saveCustomCards();

    // Mark as disabled override if official
    this.cardOverrides[id] = { ...this.cardOverrides[id], enabled: false };
    this.saveCardOverrides();
  }

  public toggleCardEnabled(id: string | number, enabled?: boolean) {
    const all = this.getAllCards();
    const existing = all.find((c) => String(c.id) === String(id));
    if (!existing) return;

    const nextState = enabled !== undefined ? enabled : !(existing.enabled !== false);

    if (existing.custom) {
      this.customCards = this.customCards.map((c) => (String(c.id) === String(id) ? { ...c, enabled: nextState } : c));
      this.saveCustomCards();
    } else {
      this.cardOverrides[id] = { ...this.cardOverrides[id], enabled: nextState };
      this.saveCardOverrides();
    }
  }

  public reportCard(id: string | number) {
    this.reportedCardIds.add(id);
    this.saveReportedCards();
  }

  public unreportCard(id: string | number) {
    this.reportedCardIds.delete(id);
    this.saveReportedCards();
  }

  // Multi-select batch actions
  public batchToggleEnabled(ids: (string | number)[], enabled: boolean) {
    ids.forEach((id) => this.toggleCardEnabled(id, enabled));
  }

  public batchDeleteCards(ids: (string | number)[]) {
    ids.forEach((id) => this.deleteCard(id));
  }

  // --- IMPORT & EXPORT PARSERS ---
  public exportToJSON(filteredCards?: CardItem[]): string {
    const cardsToExport = filteredCards || this.getAllCards();
    return JSON.stringify(cardsToExport, null, 2);
  }

  public exportToCSV(filteredCards?: CardItem[]): string {
    const cards = filteredCards || this.getAllCards();
    const headers = ['id', 'type', 'category', 'difficulty', 'age_rating', 'text', 'tags', 'enabled', 'weight'];

    const escapeCSV = (str: string) => {
      if (!str) return '""';
      const escaped = String(str).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = cards.map((c) => [
      escapeCSV(String(c.id)),
      escapeCSV(c.type),
      escapeCSV(c.category || 'soft'),
      c.difficulty || 1,
      escapeCSV(c.age_rating || '13+'),
      escapeCSV(c.text),
      escapeCSV((c.tags || []).join('|')),
      c.enabled !== false ? 'true' : 'false',
      c.weight || 1,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public parseJSONImport(jsonContent: string): ImportPreviewResult {
    let rawList: any[] = [];
    try {
      const parsed = JSON.parse(jsonContent);
      rawList = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return { validCards: [], invalidCards: [{ raw: null, reason: 'Fichier JSON invalide' }], duplicateCount: 0, conflicts: [] };
    }

    return this.processRawImportList(rawList);
  }

  public parseCSVImport(csvContent: string): ImportPreviewResult {
    const lines = csvContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      return { validCards: [], invalidCards: [{ raw: null, reason: 'Fichier CSV vide ou mal formé' }], duplicateCount: 0, conflicts: [] };
    }

    const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim().toLowerCase());

    const parseCSVLine = (text: string) => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"' && (i === 0 || text[i - 1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cur.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
      return result;
    };

    const rawList: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length === 0) continue;

      const item: any = {};
      headers.forEach((h, idx) => {
        item[h] = cols[idx] !== undefined ? cols[idx] : '';
      });

      if (item.tags && typeof item.tags === 'string') {
        item.tags = item.tags.split('|').map((t: string) => t.trim()).filter(Boolean);
      }
      if (item.enabled) {
        item.enabled = item.enabled === 'true' || item.enabled === '1';
      }
      if (item.difficulty) {
        item.difficulty = parseInt(item.difficulty, 10) || 1;
      }
      if (item.weight) {
        item.weight = parseFloat(item.weight) || 1;
      }

      rawList.push(item);
    }

    return this.processRawImportList(rawList);
  }

  private processRawImportList(rawList: any[]): ImportPreviewResult {
    const existing = this.getAllCards();
    const existingMap = new Map(existing.map((c) => [String(c.id), c]));
    const existingTextMap = new Set(existing.map((c) => `${c.type}_${c.text.trim().toLowerCase()}`));

    const validCards: CardItem[] = [];
    const invalidCards: { raw: any; reason: string }[] = [];
    const conflicts: { existing: CardItem; incoming: CardItem }[] = [];
    let duplicateCount = 0;

    rawList.forEach((raw, idx) => {
      if (!raw || typeof raw !== 'object') {
        invalidCards.push({ raw, reason: 'Objet non valide' });
        return;
      }

      const id = raw.id ? String(raw.id) : `imp_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
      const type = raw.type === 'dare' ? 'dare' : 'truth';
      const text = raw.text ? String(raw.text).trim() : '';
      const category = ['soft', 'hot', 'extreme'].includes(raw.category) ? raw.category : 'soft';
      const difficulty = Math.min(5, Math.max(1, parseInt(raw.difficulty, 10) || 1));
      const age_rating = ['13+', '16+', '18+'].includes(raw.age_rating) ? raw.age_rating : '13+';
      const tags = Array.isArray(raw.tags) ? raw.tags : typeof raw.tags === 'string' ? raw.tags.split('|') : [];
      const enabled = raw.enabled !== false;
      const weight = typeof raw.weight === 'number' ? raw.weight : 1;

      if (!text) {
        invalidCards.push({ raw, reason: 'Texte manquant' });
        return;
      }

      const candidateCard: CardItem = {
        id,
        type,
        category,
        difficulty,
        age_rating,
        text,
        tags,
        enabled,
        weight,
        custom: true,
        created_at: raw.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check ID conflict
      if (existingMap.has(id)) {
        conflicts.push({ existing: existingMap.get(id)!, incoming: candidateCard });
      }

      // Check text duplicate
      const textKey = `${type}_${text.toLowerCase()}`;
      if (existingTextMap.has(textKey)) {
        duplicateCount++;
      }

      validCards.push(candidateCard);
    });

    return {
      validCards,
      invalidCards,
      duplicateCount,
      conflicts,
    };
  }

  // Execute import resolution: 'skip' (only add new non-conflicting), 'overwrite' (replace existing), 'merge' (add with generated unique IDs)
  public executeImport(importedCards: CardItem[], conflictResolution: 'skip' | 'overwrite' | 'merge'): number {
    const existingMap = new Map(this.getAllCards().map((c) => [String(c.id), c]));
    let count = 0;

    importedCards.forEach((incoming) => {
      const exists = existingMap.has(String(incoming.id));

      if (exists) {
        if (conflictResolution === 'skip') {
          return; // Skip conflicting item
        } else if (conflictResolution === 'overwrite') {
          this.updateCard(incoming.id, incoming);
          count++;
        } else if (conflictResolution === 'merge') {
          // Generate new unique ID
          const newCard = {
            ...incoming,
            id: `imp_merge_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          };
          this.addCard(newCard);
          count++;
        }
      } else {
        this.addCard(incoming);
        count++;
      }
    });

    return count;
  }
}

export const cardEngine = new CardEngine();
