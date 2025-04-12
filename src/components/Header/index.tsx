// src/components/Header/index.tsx - Consolidated with all top buttons
import React, { memo } from 'react';
import { GitFork } from 'lucide-react';
import IconButton from '../ui/IconButton';

interface HeaderProps {
  // Layout options related props
  onToggleLayoutOptions?: () => void;
}

const Header: React.FC<HeaderProps> = memo(({
  onToggleLayoutOptions,
}) => {
  return (
    <div className="flex space-x-3">
      {/* Layout Options Button (previously NodePositioner) */}
      {onToggleLayoutOptions && (
        <IconButton
          icon={<GitFork size={18} />}
          label="Toggle Layout Options"
          onClick={onToggleLayoutOptions}
          variant="original"
        />
      )}
    </div>
  );
});

Header.displayName = 'Header';
export default Header;