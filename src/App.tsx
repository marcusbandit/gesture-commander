import TabControl from './components/TabControl';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Gesture Commander</h1>
      </header>
      <main className="app-main">
        <TabControl />
      </main>
    </div>
  );
}

export default App; 