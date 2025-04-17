import HandTracking3D from './components/HandTracking';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Gesture Commander</h1>
      </header>
      <main className="app-main">
        <HandTracking3D />
      </main>
    </div>
  );
}

export default App; 