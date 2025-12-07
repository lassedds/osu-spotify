import React from 'react';

interface FolderSelectorProps {
  label: string;
  value: string;
  onSelect: () => void;
  placeholder?: string;
}

export const FolderSelector: React.FC<FolderSelectorProps> = ({
  label,
  value,
  onSelect,
  placeholder = 'No folder selected',
}) => {
  return (
    <div className="folder-selector">
      <label>{label}</label>
      <div className="folder-input-group">
        <div className={`folder-path ${!value ? 'empty' : ''}`}>
          {value || placeholder}
        </div>
        <button className="btn btn-primary" onClick={onSelect}>
          Browse
        </button>
      </div>
    </div>
  );
};
