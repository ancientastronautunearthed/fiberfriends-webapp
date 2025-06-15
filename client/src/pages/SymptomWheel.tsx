import { SymptomTrackingWheel } from "@/components/SymptomTrackingWheel";

export default function SymptomWheel() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Symptom Tracking Wheel</h1>
          <p className="text-gray-600">
            Track your symptoms with our interactive color-coded wheel. Click on segments to adjust intensity levels and visualize your health patterns.
          </p>
        </div>
        
        <SymptomTrackingWheel />
      </div>
    </div>
  );
}