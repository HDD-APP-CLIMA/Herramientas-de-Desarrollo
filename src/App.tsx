import './App.css';
import Header from './components/Header';
import VistaClima from './components/VistaClima';

export default function App() {
  return (
    <>
      <Header />
      <main className="container py-4">
        <VistaClima />
      </main>
    </>
  );
}
