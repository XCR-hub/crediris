import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ScrollToTop } from '@/components/ScrollToTop';
import Home from '@/pages/public/Home';
import FAQ from '@/pages/public/FAQ';
import Garanties from '@/pages/public/Garanties';
import Simulation from '@/pages/public/Simulation';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import LoanApplication from '@/pages/LoanApplication';
import LoanResults from '@/pages/LoanResults';
import ContractSigning from '@/pages/ContractSigning';
import Success from '@/pages/Success';
import Profile from '@/pages/Profile';
import Error404 from '@/pages/Error404';
import Error500 from '@/pages/Error500';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public marketing routes */}
            <Route path="/" element={<Home />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/garanties" element={<Garanties />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/loan/results" element={<LoanResults />} />

            {/* Auth routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected routes */}
            <Route path="/loan/*" element={<LoanApplication />} />
            <Route path="/contract/sign" element={<ContractSigning />} />
            <Route path="/success" element={<Success />} />
            <Route path="/profile" element={<Profile />} />

            {/* Error pages */}
            <Route path="/500" element={<Error500 />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
          <Toaster />
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;