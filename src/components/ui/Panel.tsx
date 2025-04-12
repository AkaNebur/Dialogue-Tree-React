// src/components/ui/Panel.tsx
import React, { ReactNode } from 'react';
import { panelStyles } from '../../styles/commonStyles';

export type PanelVariant = 'default' | 'sidebar' | 'modal' | 'floating';

export interface PanelProps {
  children: ReactNode;
  className?: string;
  variant?: PanelVariant;
  title?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  scrollable?: boolean;
  maxHeight?: string;
  width?: string;
}

const Panel: React.FC<PanelProps> = ({
  children,
  className = '',
  variant = 'default',
  title,
  actions,
  footer,
  scrollable = false,
  maxHeight,
  width,
}) => {
  // Base panel classes
  const containerClasses = [
    panelStyles.base,
    variant !== 'default' ? panelStyles.variants[variant] : '',
    className
  ].filter(Boolean).join(' ');

  // Body classes with optional scrolling
  const bodyClasses = [
    panelStyles.body.base,
    scrollable ? panelStyles.body.scrollable : '',
    'flex-1' // Allow body to grow and take available space
  ].filter(Boolean).join(' ');

  // Optional inline styles
  const style: React.CSSProperties = {};
  if (maxHeight) style.maxHeight = maxHeight;
  if (width) style.width = width;

  return (
    <div className={containerClasses} style={style}>
      {/* Render header if title or actions are provided */}
      {(title || actions) && (
        <div className={panelStyles.header.base}>
          {title && (
            typeof title === 'string' 
              ? <h3 className={panelStyles.header.title}>{title}</h3>
              : title
          )}
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Panel body */}
      <div className={bodyClasses}>
        {children}
      </div>
      
      {/* Optional footer */}
      {footer && (
        <div className={panelStyles.footer.base}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Panel;