import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SmoothScroll from '../components/layout/SmoothScroll';
import SoftBackdrop from '../components/ui/SoftBackdrop';
import { Route, Routes } from 'react-router-dom';
import HomePage from '../features/marketing/pages/HomePage';
import GeneratePage from '../features/generation/pages/GeneratePage';
import ResultPage from '../features/generation/pages/ResultPage';
import MyGenerationsPage from '../features/generation/pages/MyGenerationsPage';
import CommunityPage from '../features/community/CommunityPage';
import PlansPage from '../features/billing/PlansPage';
import LoadingPage from '../features/generation/pages/LoadingPage';
import { Toaster } from 'react-hot-toast';

function App() {
	return (
		<>	
			<Toaster toastOptions={{style: {background: '#333', color: "#fff"}}}/>
			<SoftBackdrop />
			<SmoothScroll />
			<Navbar />

			<Routes>
				<Route path='/' element={<HomePage />}/>
				<Route path='/generate' element={<GeneratePage />}/>
				<Route path='/result/:projectId' element={<ResultPage />}/>
				<Route path='/my-generations' element={<MyGenerationsPage />}/>
				<Route path='/community' element={<CommunityPage />}/>
				<Route path='/plans' element={<PlansPage />}/>
				<Route path='/loading' element={<LoadingPage />}/>
				
			</Routes>

			<Footer />
		</>
	);
}
export default App;
