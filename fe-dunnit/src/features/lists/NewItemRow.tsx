import { useEffect, useRef, useState } from 'react'
import {
  Checkbox,
  CircularProgress,
  IconButton,
  ListItemButton,
  ListItemText,
  TextField,
} from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

type Mode = 'idle' | 'editing' | 'saving'

type Props = {
  onCreate: (title: string) => Promise<unknown>
}

export function NewItemRow({ onCreate }: Props) {
  const [mode, setMode] = useState<Mode>('idle')
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (mode === 'editing') {
      const id = window.setTimeout(() => inputRef.current?.focus(), 0)
      return () => window.clearTimeout(id)
    }
  }, [mode])

  function commit() {
    const trimmed = draft.trim()
    if (trimmed === '') {
      setDraft('')
      setMode('idle')
      return
    }
    setMode('saving')
    onCreate(trimmed)
      .then(() => {
        setDraft('')
        setMode('idle')
      })
      .catch(() => {
        // Surface the input again so the user can retry.
        setMode('editing')
      })
  }

  if (mode === 'saving') {
    return (
      <ListItemButton component="div" disableRipple>
        <IconButton size="small" disabled aria-hidden>
          <DragIndicatorIcon fontSize="small" />
        </IconButton>
        <Checkbox size="small" disabled />
        <ListItemText primary={draft} />
        <CircularProgress size={16} thickness={5} aria-label="Saving" />
      </ListItemButton>
    )
  }

  if (mode === 'editing') {
    return (
      <ListItemButton component="div" disableRipple>
        <IconButton size="small" disabled aria-hidden>
          <DragIndicatorIcon fontSize="small" />
        </IconButton>
        <Checkbox size="small" disabled />
        <TextField
          inputRef={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            } else if (e.key === 'Escape') {
              e.preventDefault()
              setDraft('')
              setMode('idle')
            }
          }}
          size="small"
          placeholder="New item name"
          fullWidth
        />
      </ListItemButton>
    )
  }

  return (
    <ListItemButton
      component="div"
      onClick={() => setMode('editing')}
      className="dunnit-row--placeholder"
    >
      <IconButton size="small" disabled aria-hidden>
        <DragIndicatorIcon fontSize="small" />
      </IconButton>
      <Checkbox size="small" disabled />
      <ListItemText primary="New item..." />
      <IconButton size="small" disabled aria-hidden>
        <ExpandMoreIcon fontSize="small" />
      </IconButton>
    </ListItemButton>
  )
}
