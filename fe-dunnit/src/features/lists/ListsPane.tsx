import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Typography,
} from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useParams } from 'react-router-dom'
import { useLists } from './useLists'
import { ListRow } from './ListRow'
import { NewListRow } from './NewListRow'
import { useConfirm } from '../ui/ConfirmContext'

export function ListsPane() {
  const { id: selectedListId } = useParams<{ id: string }>()
  const { state, createList, updateList, deleteList, reorderList } = useLists()
  const confirm = useConfirm()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id || state.status !== 'loaded') return
    const oldIdx = state.lists.findIndex((l) => l.id === active.id)
    const newIdx = state.lists.findIndex((l) => l.id === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    const next = [...state.lists]
    const [moved] = next.splice(oldIdx, 1)
    next.splice(newIdx, 0, moved)
    reorderList(next.map((l) => l.id), String(active.id)).catch(() => {
      // Reorder reverts on next refresh; nothing UI-visible to do here.
    })
  }

  return (
    <Box>
      <Box className="dunnit-pane-section-header">
        <Typography variant="sectionLabel">Lists</Typography>
      </Box>

      {state.status === 'loading' || state.status === 'idle' ? (
        <ListsSkeleton />
      ) : state.status === 'error' ? (
        <Box className="dunnit-pane-error">
          <Typography variant="body2">
            Couldn&rsquo;t load your lists: {state.error}
          </Typography>
        </Box>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={state.lists.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <List>
              {state.lists.map((list) => (
                <ListRow
                  key={list.id}
                  list={list}
                  selected={list.id === selectedListId}
                  onRequestDelete={async () => {
                    const ok = await confirm({
                      title: 'Delete this list?',
                      text: `"${list.name}" and all of its items will be deleted. This can't be undone.`,
                      destructive: true,
                    })
                    if (ok) {
                      await deleteList(list.id).catch(() => {})
                    }
                  }}
                  onRename={(name) => updateList(list.id, name)}
                />
              ))}
              <NewListRow onCreate={createList} />
            </List>
          </SortableContext>
        </DndContext>
      )}
    </Box>
  )
}

function ListsSkeleton() {
  return (
    <List aria-busy="true" aria-label="Loading lists">
      {[0, 1, 2, 3].map((i) => (
        <ListItemButton key={i} component="div" disableRipple>
          <DragIndicatorIcon fontSize="small" color="disabled" />
          <ListItemText
            primary={
              <Skeleton variant="text" width={`${60 + ((i * 23) % 30)}%`} />
            }
          />
        </ListItemButton>
      ))}
    </List>
  )
}
