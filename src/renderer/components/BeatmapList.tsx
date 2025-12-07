import React, { useState, useMemo } from 'react';
import { BeatmapInfo } from '../../types';

interface BeatmapListProps {
  beatmaps: BeatmapInfo[];
  onSelectionChange: (beatmaps: BeatmapInfo[]) => void;
}

export const BeatmapList: React.FC<BeatmapListProps> = ({ beatmaps, onSelectionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBeatmaps = useMemo(() => {
    if (!searchTerm.trim()) return beatmaps;

    const term = searchTerm.toLowerCase();
    return beatmaps.filter(
      (b) =>
        b.artist.toLowerCase().includes(term) ||
        b.title.toLowerCase().includes(term)
    );
  }, [beatmaps, searchTerm]);

  const selectedCount = beatmaps.filter((b) => b.selected).length;
  const filteredSelectedCount = filteredBeatmaps.filter((b) => b.selected).length;

  const handleToggle = (index: number) => {
    const newBeatmaps = [...beatmaps];
    const beatmapIndex = beatmaps.indexOf(filteredBeatmaps[index]);
    newBeatmaps[beatmapIndex].selected = !newBeatmaps[beatmapIndex].selected;
    onSelectionChange(newBeatmaps);
  };

  const handleSelectAll = () => {
    const newBeatmaps = [...beatmaps];
    filteredBeatmaps.forEach((fb) => {
      const index = beatmaps.indexOf(fb);
      newBeatmaps[index].selected = true;
    });
    onSelectionChange(newBeatmaps);
  };

  const handleDeselectAll = () => {
    const newBeatmaps = [...beatmaps];
    filteredBeatmaps.forEach((fb) => {
      const index = beatmaps.indexOf(fb);
      newBeatmaps[index].selected = false;
    });
    onSelectionChange(newBeatmaps);
  };

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by artist or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="selection-summary">
        <span>
          {selectedCount} of {beatmaps.length} selected
          {searchTerm && ` (${filteredSelectedCount} of ${filteredBeatmaps.length} shown)`}
        </span>
        <div className="selection-actions">
          <button className="btn btn-small btn-secondary" onClick={handleSelectAll}>
            Select All {searchTerm && 'Filtered'}
          </button>
          <button className="btn btn-small btn-danger" onClick={handleDeselectAll}>
            Deselect All {searchTerm && 'Filtered'}
          </button>
        </div>
      </div>

      <div className="beatmap-list">
        {filteredBeatmaps.map((beatmap, index) => {
          const isSelected = beatmap.selected;
          return (
            <div
              key={index}
              className={`beatmap-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleToggle(index)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(index)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="beatmap-info">
                <div className="beatmap-title">{beatmap.title}</div>
                <div className="beatmap-artist">{beatmap.artist}</div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBeatmaps.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)' }}>
          No beatmaps found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};
