import { Box, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Routes, Route, useParams } from 'react-router-dom'
import { Header } from './features/layout/Header'
import { ListsPane } from './features/lists/ListsPane'
import { ItemsPane } from './features/lists/ItemsPane'

function Layout() {
  const { id: selectedListId } = useParams<{ id: string }>()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  if (isMobile) {
    return selectedListId ? (
      <ItemsPane listId={selectedListId} />
    ) : (
      <ListsPane />
    )
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
          <Box className="dunnit-pane-empty">Select a list to see its items.</Box>
        )}
      </Box>
    </Box>
  )
}

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/lists/:id" element={<Layout />} />
      </Routes>
    </>
  )
}

export default App
