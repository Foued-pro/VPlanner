
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Plan() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  useEffect(() => {
    if (!result) {
      navigate("/explore"); // protection : si on arrive ici sans résultat
    }
  }, [result, navigate]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">✨ Ton itinéraire de voyage</h1>
      <div className="whitespace-pre-line bg-gray-100 p-4 rounded shadow">
        {result}
      </div>
    </div>
  );
}

export default Plan;
