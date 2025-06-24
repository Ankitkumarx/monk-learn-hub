
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../../contexts/ThemeContext';
import { Monitor } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleDarkMode}
      className="w-9 h-9 p-0"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Monitor className="h-4 w-4" />
    </Button>
  );
};
