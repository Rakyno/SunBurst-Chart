import SunburstCHART from "./components/SunBurstChart";
import initialdata from "./components/data.json";
import SunburstManager from "./components/SunBustManager";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Interactive Sunburst Chart
        </h1>
      </div>
      <div className=" h-screen">
        <SunburstManager dataset={initialdata} />
      </div>
    </div>
  );
};

export default App;
