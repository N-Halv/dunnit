import { IconButton, Menu, MenuItem } from '@mui/material';
import type { MouseEvent, ReactNode } from 'react';
import { useState } from 'react';

export type IconMenuItem = {
  content: ReactNode;
  action?: () => void;
};

type Props = {
  icon: ReactNode;
  items: IconMenuItem[];
  ariaLabel?: string;
};

export function IconMenu({ icon, items, ariaLabel = 'Open menu' }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  function handleTriggerClick(e: MouseEvent<HTMLButtonElement>) {
    // Don't bubble — common when the menu lives inside a clickable row.
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  }

  return (
    <>
      <IconButton
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleTriggerClick}
        size="small"
      >
        {icon}
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            disabled={!item.action}
            onClick={() => {
              setAnchorEl(null);
              item.action?.();
            }}
          >
            {item.content}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
