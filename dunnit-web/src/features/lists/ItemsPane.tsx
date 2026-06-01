import type { DragEndEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../store/hooks';
import { ItemRow } from './ItemRow';
import { NewItemRow } from './NewItemRow';
import { useItems } from './useItems';

type Props = {
  listId: string;
};

export function ItemsPane({ listId }: Props) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const lists = useAppSelector((s) => s.lists);
  const { state, createItem, updateItem, deleteItem, reorderItem } =
    useItems(listId);

  const list =
    lists.status === 'loaded'
      ? lists.lists.find((l) => l.id === listId)
      : undefined;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id || state.status !== 'loaded') return;
    const oldIdx = state.items.findIndex((i) => i.id === active.id);
    const newIdx = state.items.findIndex((i) => i.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = [...state.items];
    const [moved] = next.splice(oldIdx, 1);
    next.splice(newIdx, 0, moved);
    reorderItem(
      next.map((i) => i.id),
      String(active.id),
    ).catch(() => {
      // Reorder reverts on next refresh; nothing UI-visible to do here.
    });
  }

  const count = state.status === 'loaded' ? state.items.length : 0;

  return (
    <Box>
      <Box className="dunnit-pane-header">
        <Box className="dunnit-pane-header__title-row">
          {isMobile && (
            <IconButton
              aria-label="Back to lists"
              onClick={() => navigate('/')}
              className="dunnit-pane-header__back"
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          )}
          <Typography variant="h3">{list?.name ?? ' '}</Typography>
        </Box>
        <Typography variant="body2">
          {state.status === 'loaded'
            ? `${count} ${count === 1 ? 'item' : 'items'}`
            : ' '}
        </Typography>
      </Box>

      {state.status === 'loading' || state.status === 'idle' ? (
        <ItemsSkeleton />
      ) : state.status === 'error' ? (
        <Box className="dunnit-pane-error">
          <Typography variant="body2">
            Couldn&rsquo;t load items: {state.error}
          </Typography>
        </Box>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={state.items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <List>
              {state.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onRename={(title) =>
                    updateItem(item.id, {
                      title,
                      description: item.description,
                      completed: item.completed,
                    })
                  }
                  onUpdateDescription={(description) =>
                    updateItem(item.id, {
                      title: item.title,
                      description,
                      completed: item.completed,
                    })
                  }
                  onToggleCompleted={(completed) =>
                    updateItem(item.id, {
                      title: item.title,
                      description: item.description,
                      completed,
                    })
                  }
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
              <NewItemRow onCreate={createItem} />
            </List>
          </SortableContext>
        </DndContext>
      )}
    </Box>
  );
}

function ItemsSkeleton() {
  return (
    <List aria-busy="true" aria-label="Loading items">
      {[0, 1, 2].map((i) => (
        <ListItemButton key={i} component="div" disableRipple>
          <DragIndicatorIcon fontSize="small" color="disabled" />
          <ListItemText
            primary={
              <Skeleton variant="text" width={`${55 + ((i * 19) % 25)}%`} />
            }
          />
        </ListItemButton>
      ))}
    </List>
  );
}
