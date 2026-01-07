import { ReactQueryProvider } from "./providers/ReactQueryProvider";
import { AppRoutes } from "./routes";
import "./App.css";

function App() {
  return (
    <ReactQueryProvider>
      <AppRoutes />
    </ReactQueryProvider>
  );
}

export default App;
