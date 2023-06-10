import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App, { Login } from './App'

export default function Page() {
    return (
        <BrowserRouter>
            <Routes>
                <Route index path="/" element={<Login />} />
                <Route path="/ChatRoom" element={<App />} />
            </Routes>
        </BrowserRouter>
    );
}