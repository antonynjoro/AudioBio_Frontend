import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';
import RegistrationPage from './RegistrationPage.jsx';
import HomePage from './HomePage.jsx';
import ReadJournal from './ReadJournal.jsx';
import withAuth from '../hocs/WithAuth.jsx';

function AppRoutes() {
  const AuthHomePage = withAuth(HomePage);
  const AuthReadJournal = withAuth(ReadJournal);


  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/" element={<AuthHomePage />} />
      <Route path="/read" element={<AuthReadJournal />} />
    </Routes>
  );
}

export default AppRoutes;
