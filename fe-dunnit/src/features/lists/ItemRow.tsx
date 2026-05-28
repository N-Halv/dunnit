import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Checkbox,
  CircularProgress,
  IconButton,
  ListItemButton,
  TextField,
  Typography,
} from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ItemEntity } from './itemsSlice'
import { useConfirm } from '../ui/ConfirmContext'

type Props = {
  item: ItemEntity
  onRename: (title: string) => Promise<unknown>
  onUpdateDescription: (description: string | null) => Promise<unknown>
  onDelete: () => Promise<unknown>
}

export function ItemRow({
  item,
  onRename,
  onUpdateDescription,
  onDelete,
}: Props) {
  const confirm = useConfirm()
  const [editingTitle, setEditingTitle] = useState(false)
  const [draftTitle, setDraftTitle] = useState(item.title)
  const [editingDesc, setEditingDesc] = useState(false)
  const [draftDesc, setDraftDesc] = useState(item.description ?? '')
  const [expanded, setExpanded] = useState(false)
  // Checkbox is local-only — backend has no completed field yet.
  const [checked, setChecked] = useState(false)
  const [saving, setSaving] = useState(false)
  const titleRef = useRef<HTMLInputElement | null>(null)
  const descRef = useRef<HTMLTextAreaElement | null>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  // Runtime drag positioning is library-driven, not a design token — inline is unavoidable.
  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  useEffect(() => {
    if (editingTitle) {
      const id = window.setTimeout(() => {
        titleRef.current?.focus()
        titleRef.current?.select()
      }, 0)
      return () => window.clearTimeout(id)
    }
  }, [editingTitle])

  useEffect(() => {
    if (editingDesc) {
      const id = window.setTimeout(() => descRef.current?.focus(), 0)
      return () => window.clearTimeout(id)
    }
  }, [editingDesc])

  function commitTitle() {
    const trimmed = draftTitle.trim()
    if (trimmed === '') {
      titleRef.current?.focus()
      return
    }
    if (trimmed === item.title) {
      setEditingTitle(false)
      return
    }
    setEditingTitle(false)
    setSaving(true)
    onRename(trimmed)
      .catch(() => setDraftTitle(item.title))
      .finally(() => setSaving(false))
  }

  function commitDesc() {
    const current = item.description ?? ''
    if (draftDesc === current) {
      setEditingDesc(false)
      return
    }
    setEditingDesc(false)
    setSaving(true)
    onUpdateDescription(draftDesc === '' ? null : draftDesc)
      .catch(() => setDraftDesc(item.description ?? ''))
      .finally(() => setSaving(false))
  }

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete this item?',
      text: `"${item.title}" will be deleted. This can't be undone.`,
      destructive: true,
    })
    if (!ok) return
    setSaving(true)
    try {
      await onDelete()
      // Row unmounts on success, so no need to clear saving.
    } catch {
      setSaving(false)
    }
  }

  return (
    <Box ref={setNodeRef} style={dragStyle}>
      <ListItemButton component="div" disableRipple>
        <IconButton
          size="small"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>

        <Checkbox
          size="small"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />

        {editingTitle ? (
          <TextField
            inputRef={titleRef}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitTitle()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                setDraftTitle(item.title)
                setEditingTitle(false)
              }
            }}
            size="small"
            fullWidth
          />
        ) : (
          <Typography
            className="dunnit-item-title"
            onClick={() => {
              setDraftTitle(item.title)
              setEditingTitle(true)
            }}
          >
            {item.title}
          </Typography>
        )}

        {saving && (
          <CircularProgress size={16} thickness={5} aria-label="Saving" />
        )}

        <IconButton
          size="small"
          aria-label={expanded ? 'Collapse item' : 'Expand item'}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </IconButton>
      </ListItemButton>

      {expanded && (
        <Box className="dunnit-item-expanded">
          {editingDesc ? (
            <TextField
              inputRef={descRef}
              value={draftDesc}
              onChange={(e) => setDraftDesc(e.target.value)}
              onBlur={commitDesc}
              multiline
              minRows={2}
              size="small"
              fullWidth
              placeholder="Add a description..."
            />
          ) : (
            <Typography
              className={
                item.description
                  ? 'dunnit-item-description'
                  : 'dunnit-item-description dunnit-item-description--empty'
              }
              onClick={() => {
                setDraftDesc(item.description ?? '')
                setEditingDesc(true)
              }}
            >
              {item.description ?? 'Add a description...'}
            </Typography>
          )}
          <button
            type="button"
            className="dunnit-item-delete"
            onClick={handleDelete}
          >
            Delete item
          </button>
        </Box>
      )}
    </Box>
  )
}
