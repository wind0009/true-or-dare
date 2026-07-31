import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Plus,
  Sparkles,
  Trash2,
  HelpCircle,
  Flame,
  RefreshCw,
  Check,
  Search,
  Filter,
  Upload,
  Download,
  Edit3,
  Copy,
  AlertTriangle,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  ShieldAlert,
  FileJson,
  FileText,
  BarChart2,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { CardItem, CardType, GameModeId, IntensityLevel } from '../types';
import { cardEngine, ImportPreviewResult } from '../services/cardEngine';
import { sound } from '../utils/sound';

interface CardManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModeId: GameModeId;
  playersList: string[];
  onCardsUpdated?: () => void;
}

export const CardManagerModal: React.FC<CardManagerModalProps> = ({
  isOpen,
  onClose,
  currentModeId,
  playersList,
  onCardsUpdated,
}) => {
  // Main Tab: 'list' | 'ai' | 'io'
  const [activeTab, setActiveTab] = useState<'list' | 'ai' | 'io'>('list');

  // Trigger state refresh
  const [refreshKey, setRefreshKey] = useState(0);

  // Search & Filter controls
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | CardType>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'soft' | 'hot' | 'extreme'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | number>('all');
  const [filterAge, setFilterAge] = useState<'all' | '13+' | '16+' | '18+'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled' | 'reported'>('all');
  const [filterTag, setFilterTag] = useState<string>('');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Edit / Add Card Modal State
  const [editingCard, setEditingCard] = useState<Partial<CardItem> | null>(null);
  const [cardFormError, setCardFormError] = useState<string>('');
  const [cardFormWarning, setCardFormWarning] = useState<string>('');

  // AI Prompt controls
  const [aiTheme, setAiTheme] = useState('Anecdotes de lycée et secrets comiques');
  const [aiCount, setAiCount] = useState(5);
  const [aiIntensity, setAiIntensity] = useState<IntensityLevel>('soft');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  // Import / Export states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<ImportPreviewResult | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importFileType, setImportFileType] = useState<'json' | 'csv'>('json');
  const [conflictResolution, setConflictResolution] = useState<'skip' | 'overwrite' | 'merge'>('merge');
  const [importStatusMsg, setImportStatusMsg] = useState<string>('');

  const notifyChange = () => {
    setRefreshKey((k) => k + 1);
    if (onCardsUpdated) onCardsUpdated();
  };

  // Get all cards dynamically
  const allCards = cardEngine.getAllCards();

  // Calculate statistics
  const stats = useMemo(() => {
    const total = allCards.length;
    const truths = allCards.filter((c) => c.type === 'truth').length;
    const dares = allCards.filter((c) => c.type === 'dare').length;
    const soft = allCards.filter((c) => c.category === 'soft').length;
    const hot = allCards.filter((c) => c.category === 'hot').length;
    const extreme = allCards.filter((c) => c.category === 'extreme').length;
    const disabled = allCards.filter((c) => c.enabled === false).length;
    const reported = allCards.filter((c) => c.reported === true).length;
    return { total, truths, dares, soft, hot, extreme, disabled, reported };
  }, [allCards, refreshKey]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allCards.forEach((c) => {
      (c.tags || []).forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [allCards, refreshKey]);

  // Filtered Cards list
  const filteredCards = useMemo(() => {
    return allCards.filter((c) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch = c.text.toLowerCase().includes(q);
        const tagMatch = (c.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!textMatch && !tagMatch) return false;
      }

      // Type
      if (filterType !== 'all' && c.type !== filterType) return false;

      // Category
      if (filterCategory !== 'all' && c.category !== filterCategory) return false;

      // Difficulty
      if (filterDifficulty !== 'all' && (c.difficulty || 1) !== filterDifficulty) return false;

      // Age
      if (filterAge !== 'all' && (c.age_rating || '13+') !== filterAge) return false;

      // Status
      if (filterStatus === 'enabled' && c.enabled === false) return false;
      if (filterStatus === 'disabled' && c.enabled !== false) return false;
      if (filterStatus === 'reported' && !c.reported) return false;

      // Tag
      if (filterTag && !(c.tags || []).includes(filterTag)) return false;

      return true;
    });
  }, [allCards, searchQuery, filterType, filterCategory, filterDifficulty, filterAge, filterStatus, filterTag, refreshKey]);

  // --- HANDLERS FOR CARD LIST ---
  const handleToggleCardEnabled = (id: string | number) => {
    sound.playClick();
    cardEngine.toggleCardEnabled(id);
    notifyChange();
  };

  const handleDeleteCard = (id: string | number) => {
    if (window.confirm('Es-tu sûr de vouloir supprimer cette carte ?')) {
      sound.playPass();
      cardEngine.deleteCard(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      notifyChange();
    }
  };

  const handleDuplicateCard = (card: CardItem) => {
    sound.playWinner();
    const copy: CardItem = {
      ...card,
      id: `custom_dup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: `${card.text} (copie)`,
      custom: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    cardEngine.addCard(copy);
    notifyChange();
  };

  const handleToggleReport = (id: string | number, isReported: boolean) => {
    sound.playClick();
    if (isReported) {
      cardEngine.unreportCard(id);
    } else {
      cardEngine.reportCard(id);
    }
    notifyChange();
  };

  // --- BULK SELECTION HANDLERS ---
  const handleSelectAllFiltered = () => {
    if (selectedIds.size === filteredCards.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCards.map((c) => c.id)));
    }
  };

  const handleToggleSelectId = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchEnable = (enable: boolean) => {
    sound.playClick();
    cardEngine.batchToggleEnabled(Array.from(selectedIds), enable);
    setSelectedIds(new Set());
    notifyChange();
  };

  const handleBatchDelete = () => {
    if (window.confirm(`Supprimer ${selectedIds.size} carte(s) sélectionnée(s) ?`)) {
      sound.playPass();
      cardEngine.batchDeleteCards(Array.from(selectedIds));
      setSelectedIds(new Set());
      notifyChange();
    }
  };

  // --- CREATE / EDIT FORM HANDLERS ---
  const handleOpenAddCard = () => {
    sound.playClick();
    setEditingCard({
      type: 'truth',
      category: 'soft',
      difficulty: 1,
      age_rating: '13+',
      text: '',
      tags: [],
      enabled: true,
      weight: 1,
    });
    setCardFormError('');
    setCardFormWarning('');
  };

  const handleOpenEditCard = (card: CardItem) => {
    sound.playClick();
    setEditingCard({ ...card });
    setCardFormError('');
    setCardFormWarning('');
  };

  const handleSaveCardForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    setCardFormError('');
    setCardFormWarning('');

    let res;
    if (editingCard.id) {
      res = cardEngine.updateCard(editingCard.id, editingCard);
    } else {
      res = cardEngine.addCard(editingCard as CardItem);
    }

    if (!res.isValid) {
      sound.playPass();
      setCardFormError(res.errors.join(' '));
      if (res.warnings.length > 0) setCardFormWarning(res.warnings.join(' '));
      return;
    }

    sound.playWinner();
    setEditingCard(null);
    notifyChange();
  };

  // --- AI GENERATION HANDLER ---
  const handleGenerateWithAI = async () => {
    sound.playClick();
    setIsAiGenerating(true);
    setAiSuccessMsg('');

    try {
      const res = await fetch('/api/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: currentModeId,
          category: aiTheme,
          players: playersList,
          count: aiCount,
          intensity: aiIntensity,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      const generatedList: CardItem[] = [];

      (data.truths || []).forEach((itemText: string) => {
        generatedList.push({
          id: `ai_t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'truth',
          text: itemText,
          category: aiIntensity === 'hot' ? 'hot' : aiIntensity === 'extreme' ? 'extreme' : 'soft',
          difficulty: aiIntensity === 'hard' || aiIntensity === 'extreme' ? 4 : 2,
          age_rating: aiIntensity === 'hot' || aiIntensity === 'extreme' ? '18+' : '13+',
          mode: currentModeId,
          intensity: aiIntensity,
          custom: true,
          enabled: true,
          weight: 1,
        });
      });

      (data.dares || []).forEach((itemText: string) => {
        generatedList.push({
          id: `ai_d_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'dare',
          text: itemText,
          category: aiIntensity === 'hot' ? 'hot' : aiIntensity === 'extreme' ? 'extreme' : 'soft',
          difficulty: aiIntensity === 'hard' || aiIntensity === 'extreme' ? 4 : 2,
          age_rating: aiIntensity === 'hot' || aiIntensity === 'extreme' ? '18+' : '13+',
          mode: currentModeId,
          intensity: aiIntensity,
          custom: true,
          enabled: true,
          weight: 1,
        });
      });

      generatedList.forEach((c) => cardEngine.addCard(c));
      sound.playWinner();
      setAiSuccessMsg(`🎉 ${generatedList.length} cartes générées et enregistrées avec succès !`);
      notifyChange();
    } catch (err: any) {
      sound.playPass();
      alert("Impossible de générer avec l'IA : " + err.message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // --- IMPORT / EXPORT HANDLERS ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const isCsv = file.name.endsWith('.csv');
    setImportFileType(isCsv ? 'csv' : 'json');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      let preview: ImportPreviewResult;
      if (isCsv) {
        preview = cardEngine.parseCSVImport(content);
      } else {
        preview = cardEngine.parseJSONImport(content);
      }

      setImportPreview(preview);
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importPreview || importPreview.validCards.length === 0) return;

    sound.playWinner();
    const count = cardEngine.executeImport(importPreview.validCards, conflictResolution);
    setImportStatusMsg(`✅ ${count} carte(s) importée(s) avec succès !`);
    setImportPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    notifyChange();
  };

  const handleExportJSON = (onlyFiltered: boolean = false) => {
    sound.playClick();
    const jsonStr = cardEngine.exportToJSON(onlyFiltered ? filteredCards : undefined);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cartes_action_verite_${onlyFiltered ? 'filtrees' : 'completes'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = (onlyFiltered: boolean = false) => {
    sound.playClick();
    const csvStr = cardEngine.exportToCSV(onlyFiltered ? filteredCards : undefined);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cartes_action_verite_${onlyFiltered ? 'filtrees' : 'completes'}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#180d35] border border-purple-900/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-[#110826] border-b border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black flex items-center gap-2">
                <span>Gestionnaire des Cartes</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {stats.total} Cartes
                </span>
              </h2>
              <p className="text-xs text-slate-400">Filtre, édite, ajoute ou importe ton paquet complet de cartes</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-[#27184c] hover:bg-[#342263] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-purple-900/40 bg-[#140b2b] p-2 gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('list');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'list'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Catalogue & Édition ({filteredCards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('ai');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-indigo-400 hover:text-indigo-300 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Générateur IA</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('io');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'io'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-white/5'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import / Export (JSON/CSV)</span>
          </button>
        </div>

        {/* Main Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: CARD CATALOGUE & LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              
              {/* Stats Summary Counter Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                <div className="bg-[#241547] border border-purple-500/20 p-2.5 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-400">Total Cartes</span>
                  <span className="text-white font-black text-sm">{stats.total}</span>
                </div>
                <div className="bg-[#241547] border border-purple-500/20 p-2.5 rounded-2xl flex items-center justify-between">
                  <span className="text-pink-300">💬 Vérités</span>
                  <span className="text-pink-400 font-black text-sm">{stats.truths}</span>
                </div>
                <div className="bg-[#241547] border border-purple-500/20 p-2.5 rounded-2xl flex items-center justify-between">
                  <span className="text-amber-300">⚡ Actions</span>
                  <span className="text-amber-400 font-black text-sm">{stats.dares}</span>
                </div>
                <div className="bg-[#241547] border border-purple-500/20 p-2.5 rounded-2xl flex items-center justify-between">
                  <span className="text-rose-400">Signalées</span>
                  <span className="text-rose-400 font-black text-sm">{stats.reported}</span>
                </div>
              </div>

              {/* Action Bar: Search + Create Button */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un mot clé dans les cartes..."
                    className="w-full bg-[#110826] border border-purple-900/40 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:border-rose-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddCard}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer une Carte</span>
                </button>
              </div>

              {/* Filter controls panel */}
              <div className="bg-[#110826] border border-purple-900/30 p-3 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-300 mb-1">
                  <Filter className="w-3.5 h-3.5 text-rose-400" />
                  <span>Filtres de recherche avancés :</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {/* Type */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="bg-[#241547] border border-purple-900/40 rounded-xl px-2.5 py-1.5 text-white outline-none"
                  >
                    <option value="all">Types: Tous</option>
                    <option value="truth">Vérités (💬)</option>
                    <option value="dare">Actions (⚡)</option>
                  </select>

                  {/* Category */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    className="bg-[#241547] border border-purple-900/40 rounded-xl px-2.5 py-1.5 text-white outline-none"
                  >
                    <option value="all">Catégories: Toutes</option>
                    <option value="soft">Soft 🟢</option>
                    <option value="hot">Hot 🌶️</option>
                    <option value="extreme">Extrême 💀</option>
                  </select>

                  {/* Difficulty */}
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="bg-[#241547] border border-purple-900/40 rounded-xl px-2.5 py-1.5 text-white outline-none"
                  >
                    <option value="all">Difficultés: Toutes</option>
                    <option value="1">Niveau 1 (Facile)</option>
                    <option value="2">Niveau 2 (Moyen)</option>
                    <option value="3">Niveau 3 (Intermédiaire)</option>
                    <option value="4">Niveau 4 (Intense)</option>
                    <option value="5">Niveau 5 (Extreme)</option>
                  </select>

                  {/* Age */}
                  <select
                    value={filterAge}
                    onChange={(e) => setFilterAge(e.target.value as any)}
                    className="bg-[#241547] border border-purple-900/40 rounded-xl px-2.5 py-1.5 text-white outline-none"
                  >
                    <option value="all">Âge: Tous</option>
                    <option value="13+">13+</option>
                    <option value="16+">16+</option>
                    <option value="18+">18+</option>
                  </select>

                  {/* Status */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="bg-[#241547] border border-purple-900/40 rounded-xl px-2.5 py-1.5 text-white outline-none"
                  >
                    <option value="all">Statuts: Tous</option>
                    <option value="enabled">Actives uniquement</option>
                    <option value="disabled">Désactivées uniquement</option>
                    <option value="reported">Signalées (🚨)</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              <div className="flex items-center justify-between bg-[#1f113d] border border-purple-900/40 px-3 py-2 rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="flex items-center gap-1.5 text-slate-300 hover:text-white font-bold"
                  >
                    {selectedIds.size === filteredCards.length && filteredCards.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                    <span>Tout Sélectionner ({selectedIds.size})</span>
                  </button>
                </div>

                {selectedIds.size > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBatchEnable(true)}
                      className="px-2.5 py-1 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl font-bold hover:bg-emerald-600/30"
                    >
                      Activer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchEnable(false)}
                      className="px-2.5 py-1 bg-amber-600/20 text-amber-300 border border-amber-500/30 rounded-xl font-bold hover:bg-amber-600/30"
                    >
                      Désactiver
                    </button>
                    <button
                      type="button"
                      onClick={handleBatchDelete}
                      className="px-2.5 py-1 bg-rose-600/20 text-rose-300 border border-rose-500/30 rounded-xl font-bold hover:bg-rose-600/30"
                    >
                      Supprimer ({selectedIds.size})
                    </button>
                  </div>
                )}
              </div>

              {/* Cards List Display */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredCards.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-purple-900/40 rounded-3xl bg-[#110826]/40">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
                    <p className="text-slate-400 text-xs font-semibold">Aucune carte ne correspond aux filtres appliqués.</p>
                  </div>
                ) : (
                  filteredCards.map((card) => {
                    const isSelected = selectedIds.has(card.id);
                    const isEnabled = card.enabled !== false;
                    const isTruth = card.type === 'truth';

                    return (
                      <div
                        key={card.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          !isEnabled
                            ? 'bg-[#110826]/40 border-slate-800 opacity-60'
                            : isSelected
                            ? 'bg-[#2f1b5b] border-rose-500/60 shadow-md'
                            : 'bg-[#1e113a] border-purple-900/30 hover:border-purple-500/40'
                        }`}
                      >
                        {/* Checkbox & Card Header */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectId(card.id)}
                            className="mt-0.5 text-slate-400 hover:text-white shrink-0"
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4 text-rose-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                          </button>

                          <div className="space-y-1 min-w-0 flex-1">
                            {/* Badges line */}
                            <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-black">
                              <span className={`px-2 py-0.5 rounded-lg border ${isTruth ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                                {isTruth ? '💬 VÉRITÉ' : '⚡ ACTION'}
                              </span>

                              <span className="px-2 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/10 uppercase">
                                {card.category || 'soft'}
                              </span>

                              <span className="px-1.5 py-0.5 rounded-lg bg-white/5 text-slate-400">
                                Niv. {card.difficulty || 1}
                              </span>

                              <span className="px-1.5 py-0.5 rounded-lg bg-white/5 text-slate-400">
                                {card.age_rating || '13+'}
                              </span>

                              {card.custom && (
                                <span className="px-1.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  Perso ✏️
                                </span>
                              )}

                              {card.reported && (
                                <span className="px-1.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                                  <ShieldAlert className="w-3 h-3 text-rose-400" /> Signalée
                                </span>
                              )}
                            </div>

                            {/* Card Text */}
                            <p className="text-xs text-slate-100 font-medium leading-relaxed break-words">
                              {card.text}
                            </p>
                          </div>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                          {/* Enable/Disable Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleCardEnabled(card.id)}
                            className={`p-1.5 rounded-xl border text-xs font-bold transition-colors ${
                              isEnabled
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                            }`}
                            title={isEnabled ? 'Désactiver la carte' : 'Activer la carte'}
                          >
                            {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          {/* Report Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleReport(card.id, !!card.reported)}
                            className={`p-1.5 rounded-xl border text-xs font-bold transition-colors ${
                              card.reported
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-slate-800/40 text-slate-400 border-white/10 hover:text-rose-400'
                            }`}
                            title={card.reported ? 'Retirer le signalement' : 'Signaler cette carte'}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateCard(card)}
                            className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
                            title="Dupliquer la carte"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditCard(card)}
                            className="p-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors"
                            title="Éditer la carte"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-1.5 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 transition-colors"
                            title="Supprimer la carte"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI GEMINI GENERATOR */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl">
                <h4 className="font-extrabold text-indigo-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Génération intelligente de cartes personnalisées via Gemini</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  L'IA va composer une série de défis et vérités parfaitement calibrés selon ton thème et la liste de tes joueurs !
                </p>
              </div>

              <div className="space-y-3 bg-[#110826] border border-purple-900/30 p-4 rounded-2xl text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Thème / Sujet de la génération :
                  </label>
                  <input
                    type="text"
                    value={aiTheme}
                    onChange={(e) => setAiTheme(e.target.value)}
                    placeholder="Ex: Secrets de vacances, Révélations de soirée..."
                    className="w-full bg-[#241547] border border-purple-900/40 rounded-xl p-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Intensité souhaitée :</label>
                    <select
                      value={aiIntensity}
                      onChange={(e) => setAiIntensity(e.target.value as IntensityLevel)}
                      className="w-full bg-[#241547] border border-purple-900/40 rounded-xl p-3 text-white outline-none"
                    >
                      <option value="soft">Soft 🟢 (Fun & Amical)</option>
                      <option value="hot">Hot 🌶️ (Coquin & Séduction)</option>
                      <option value="hard">Hard 🔥 (Gages physique & Gêne)</option>
                      <option value="extreme">Extrême 💀 (Forfaits & Sans filtre)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Nombre par type :</label>
                    <select
                      value={aiCount}
                      onChange={(e) => setAiCount(Number(e.target.value))}
                      className="w-full bg-[#241547] border border-purple-900/40 rounded-xl p-3 text-white outline-none"
                    >
                      <option value="3">3 Vérités & 3 Actions</option>
                      <option value="5">5 Vérités & 5 Actions</option>
                      <option value="10">10 Vérités & 10 Actions</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isAiGenerating}
                onClick={handleGenerateWithAI}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Génération Gemini en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Générer {aiCount * 2} Nouvelles Cartes !</span>
                  </>
                )}
              </button>

              {aiSuccessMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold text-center">
                  {aiSuccessMsg}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IMPORT & EXPORT (JSON / CSV) */}
          {activeTab === 'io' && (
            <div className="space-y-5">
              
              {/* Export Panel */}
              <div className="bg-[#110826] border border-purple-900/40 p-4 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-sm text-emerald-300 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Exportation de ton Paquet de Cartes</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Télécharge les cartes actuellement enregistrées au format JSON ou CSV (compatible Excel).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportJSON(false)}
                    className="py-2.5 px-3 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    <FileJson className="w-4 h-4 text-emerald-400" />
                    <span>Exporter Tout en JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportCSV(false)}
                    className="py-2.5 px-3 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Exporter Tout en CSV</span>
                  </button>
                </div>

                {filteredCards.length !== allCards.length && (
                  <div className="pt-2 border-t border-purple-900/30 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportJSON(true)}
                      className="flex-1 py-2 bg-purple-500/20 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-semibold hover:bg-purple-500/30"
                    >
                      Exporter Filtre Actuel JSON ({filteredCards.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportCSV(true)}
                      className="flex-1 py-2 bg-purple-500/20 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-semibold hover:bg-purple-500/30"
                    >
                      Exporter Filtre Actuel CSV ({filteredCards.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Import Panel */}
              <div className="bg-[#110826] border border-purple-900/40 p-4 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-sm text-indigo-300 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>Importation d'un Fichier (JSON ou CSV 600 Cartes)</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sélectionne ton fichier JSON ou CSV pour ajouter ou remplacer des cartes. Dans les fichiers CSV, les tags doivent être séparés par le symbole <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">|</code>.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choisir un fichier JSON ou CSV sur ton ordinateur</span>
                </button>

                {importStatusMsg && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold text-center">
                    {importStatusMsg}
                  </div>
                )}

                {/* Import Preview Modal / Resolution Details */}
                {importPreview && (
                  <div className="p-4 bg-[#1e113a] border border-indigo-500/40 rounded-2xl space-y-3 text-xs animate-in fade-in">
                    <h4 className="font-extrabold text-white text-xs flex items-center justify-between">
                      <span>Aperçu de l'import : {importFileName}</span>
                      <span className="text-indigo-300 font-normal">Format: {importFileType.toUpperCase()}</span>
                    </h4>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center font-bold text-[11px]">
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl">
                        Valides: {importPreview.validCards.length}
                      </div>
                      <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl">
                        Doublons détectés: {importPreview.duplicateCount}
                      </div>
                      <div className="p-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl">
                        Conflits d'ID: {importPreview.conflicts.length}
                      </div>
                    </div>

                    {/* Conflict Resolution Selector */}
                    {importPreview.conflicts.length > 0 && (
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">En cas de conflits d'identifiants :</label>
                        <select
                          value={conflictResolution}
                          onChange={(e) => setConflictResolution(e.target.value as any)}
                          className="w-full bg-[#110826] border border-purple-900/40 rounded-xl p-2 text-white outline-none"
                        >
                          <option value="merge">Fusionner (Créer de nouveaux ID uniques)</option>
                          <option value="overwrite">Remplacer les cartes existantes</option>
                          <option value="skip">Ignorer les cartes en conflit</option>
                        </select>
                      </div>
                    )}

                    {/* Confirm Button */}
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleConfirmImport}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30"
                      >
                        Valider et Importer {importPreview.validCards.length} Cartes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImportPreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* CREATE / EDIT CARD MODAL OVERLAY */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#180d35] border border-purple-900/60 rounded-3xl p-5 shadow-2xl text-white space-y-4">
            
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-rose-400" />
                <span>{editingCard.id ? 'Modifier la Carte' : 'Créer une nouvelle Carte'}</span>
              </h3>
              <button
                onClick={() => setEditingCard(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCardForm} className="space-y-3 text-xs">
              
              {/* Type */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Type de Carte :</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCard({ ...editingCard, type: 'truth' })}
                    className={`py-2 rounded-xl border font-bold flex items-center justify-center gap-2 ${
                      editingCard.type === 'truth'
                        ? 'bg-pink-500/20 text-pink-300 border-pink-500'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" /> 💬 Vérité
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCard({ ...editingCard, type: 'dare' })}
                    className={`py-2 rounded-xl border font-bold flex items-center justify-center gap-2 ${
                      editingCard.type === 'dare'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    <Flame className="w-4 h-4" /> ⚡ Action
                  </button>
                </div>
              </div>

              {/* Text */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Intitulé (variables autorisées: <code className="text-amber-300">{"{{player}}"}</code>, <code className="text-amber-300">{"{{target}}"}</code>) :
                </label>
                <textarea
                  value={editingCard.text || ''}
                  onChange={(e) => setEditingCard({ ...editingCard, text: e.target.value })}
                  placeholder="Ex: {{player}}, fais rigoler {{target}} en moins de 20 secondes."
                  className="w-full bg-[#110826] border border-purple-900/40 focus:border-rose-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none h-20 resize-none"
                />
              </div>

              {/* Grid: Category, Difficulty, Age */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Catégorie :</label>
                  <select
                    value={editingCard.category || 'soft'}
                    onChange={(e) => setEditingCard({ ...editingCard, category: e.target.value as any })}
                    className="w-full bg-[#110826] border border-purple-900/40 rounded-xl p-2 text-white outline-none"
                  >
                    <option value="soft">Soft 🟢</option>
                    <option value="hot">Hot 🌶️</option>
                    <option value="extreme">Extrême 💀</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Difficulté (1-5) :</label>
                  <select
                    value={editingCard.difficulty || 1}
                    onChange={(e) => setEditingCard({ ...editingCard, difficulty: Number(e.target.value) })}
                    className="w-full bg-[#110826] border border-purple-900/40 rounded-xl p-2 text-white outline-none"
                  >
                    <option value={1}>1 - Facile</option>
                    <option value={2}>2 - Moyen</option>
                    <option value={3}>3 - Intermédiaire</option>
                    <option value={4}>4 - Intense</option>
                    <option value={5}>5 - Extreme</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Âge Min :</label>
                  <select
                    value={editingCard.age_rating || '13+'}
                    onChange={(e) => setEditingCard({ ...editingCard, age_rating: e.target.value as any })}
                    className="w-full bg-[#110826] border border-purple-900/40 rounded-xl p-2 text-white outline-none"
                  >
                    <option value="13+">13+</option>
                    <option value="16+">16+</option>
                    <option value="18+">18+</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Tags (séparés par des virgules) :</label>
                <input
                  type="text"
                  value={(editingCard.tags || []).join(', ')}
                  onChange={(e) =>
                    setEditingCard({
                      ...editingCard,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="drôle, soirée, défi"
                  className="w-full bg-[#110826] border border-purple-900/40 rounded-xl p-2 text-white placeholder-slate-500 outline-none"
                />
              </div>

              {/* Errors & Warnings */}
              {cardFormError && (
                <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 font-bold text-center">
                  {cardFormError}
                </div>
              )}
              {cardFormWarning && (
                <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 font-bold text-center">
                  {cardFormWarning}
                </div>
              )}

              {/* Submit / Cancel */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-600/30"
                >
                  Enregistrer la Carte
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Annuler
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
