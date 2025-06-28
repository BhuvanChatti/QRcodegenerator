import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { ToastContainer } from 'react-toastify';
import MyQRs from './pages/QR';
import { QRrefresh } from './pages/Refrshcontext';

function App() {
  return (
    <BrowserRouter>
      <QRrefresh>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/myqrs" element={<MyQRs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </QRrefresh>
    </BrowserRouter>
  );
}

export default App;
