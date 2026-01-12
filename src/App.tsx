import { ReactQueryProvider } from "./providers/ReactQueryProvider";
import { ToastProvider } from "./providers/ToastProvider";
import { AppRoutes } from "./routes";
import "./App.css";

function App() {
  return (
    <ReactQueryProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </ReactQueryProvider>
  );
}

export default App;
