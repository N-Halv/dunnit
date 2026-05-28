import { Routes, Route } from 'react-router-dom'
import { Header } from './features/layout/Header'

function ListsPlaceholder() {
  return null
}

function ItemsPlaceholder() {
  return null
}

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<ListsPlaceholder />} />
        <Route path="/lists/:id" element={<ItemsPlaceholder />} />
      </Routes>
    </>
  )
}

export default App
