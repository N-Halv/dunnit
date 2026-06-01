import { Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Route, Routes, useParams } from 'react-router-dom';

import { Header } from './features/layout/Header';
import { ItemsPane } from './features/lists/ItemsPane';
import { ListsPane } from './features/lists/ListsPane';

function Layout() {
  const { id: selectedListId } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return selectedListId ? (
      <ItemsPane listId={selectedListId} />
    ) : (
      <ListsPane />
    );
  }

  return (
    <Box className="dunnit-layout">
      <Box className="dunnit-layout__lists">
        <ListsPane />
      </Box>
      <Box className="dunnit-layout__items">
        {selectedListId ? (
          <ItemsPane listId={selectedListId} />
        ) : (
          <Box className="dunnit-pane-empty">
            Select a list to see its items.
          </Box>
        )}
      </Box>
    </Box>
  );
}

function NotFound() {
  return (
    <Box className="dunnit-fullscreen-stack">
      <Typography variant="h1">Page not found</Typography>
      <Typography variant="body2">
        The page you’re looking for doesn’t exist.
      </Typography>
    </Box>
  );
}

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/lists/:id" element={<Layout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
