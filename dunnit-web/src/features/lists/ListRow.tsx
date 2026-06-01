import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  CircularProgress,
  IconButton,
  ListItemButton,
  ListItemText,
  TextField,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { IconMenu } from '../ui/IconMenu';
import { LIST_NAME_MAX_LENGTH } from './limits';
import type { ListEntity } from './listsSlice';

type Props = {
  list: ListEntity;
  selected: boolean;
  onRequestDelete: () => void;
  onRename: (name: string) => Promise<unknown>;
};

export function ListRow({ list, selected, onRequestDelete, onRename }: Props) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(list.name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  // Runtime drag positioning is library-driven, not a design token — inline is unavoidable.
  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  useEffect(() => {
    if (editing) {
      const id = window.setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [editing]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed === '') {
      // Stay in edit mode; refocus the input.
      inputRef.current?.focus();
      return;
    }
    if (trimmed === list.name) {
      setEditing(false);
      return;
    }
    setEditing(false);
    setSaving(true);
    onRename(trimmed)
      .catch(() => {
        setDraft(list.name);
      })
      .finally(() => setSaving(false));
  }

  function cancel() {
    setDraft(list.name);
    setEditing(false);
  }

  return (
    <div ref={setNodeRef} style={dragStyle}>
      <ListItemButton
        component="div"
        selected={selected}
        disableRipple={editing}
        onClick={() => {
          if (editing) return;
          navigate(`/lists/${list.id}`);
        }}
        {...attributes}
      >
        <IconButton
          size="small"
          aria-label="Drag to reorder"
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>

        {editing ? (
          <TextField
            inputRef={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            size="small"
            fullWidth
            slotProps={{ htmlInput: { maxLength: LIST_NAME_MAX_LENGTH } }}
          />
        ) : (
          <ListItemText primary={list.name} />
        )}

        {saving && (
          <CircularProgress size={16} thickness={5} aria-label="Saving" />
        )}

        <IconMenu
          ariaLabel="List options"
          icon={<MoreVertIcon fontSize="small" />}
          items={[
            {
              content: 'Edit',
              action: () => {
                setDraft(list.name);
                setEditing(true);
              },
            },
            { content: 'Delete', action: onRequestDelete },
          ]}
        />
      </ListItemButton>
    </div>
  );
}
