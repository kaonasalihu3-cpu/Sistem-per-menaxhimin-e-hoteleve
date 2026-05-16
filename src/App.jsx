import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RoomTypesPage from './pages/RoomTypePage';
import RoomPage from './pages/RoomPage';
import RoomDetailPage from './pages/RoomDetailPage';

function App(){
    return (
        <Layout>
            <Routes>
                <Route path="/"element={<Navigate to="/rooms" replace />} />
                <Route path="/room-types" element={<RoomTypesPage/>}/>
                <Route path="/rooms" element={<RoomsPage/>}/>
                <Route path="/rooms/:id" element={<RoomDetailPage/>}/>
            </Routes>
        </Layout>
    );
}

export default App;