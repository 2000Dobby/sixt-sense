import { dataSource } from "@/lib/dataSource.current";
import { getRecommendationsForBooking } from "@/lib/recommendations";
import type { Vehicle } from "@/lib/sixtApi";
import { PERSONAS } from "@/lib/personas";

function getVehicleDisplayName(vehicle: Vehicle): string {
  const anyVehicle = vehicle as any;
  return (
    (typeof anyVehicle.name === "string" && anyVehicle.name) ||
    (typeof anyVehicle.model === "string" && anyVehicle.model) ||
    (typeof anyVehicle.description === "string" && anyVehicle.description) ||
    vehicle.id
  );
}

export default async function DemoPage({ searchParams }: { searchParams: { persona?: string; vehicle?: string } }) {
  // 1. Create a fresh demo booking
  const booking = await dataSource.createBooking();
  const bookingId = booking.id;
  
  // Get optional params
  const selectedPersonaId = searchParams.persona;
  const selectedVehicleId = searchParams.vehicle;

  // Get available vehicles for selector
  const availableVehicles = await dataSource.getAvailableVehicles(bookingId);

  // 2. Get recommendations directly on the server
  const recommendations = await getRecommendationsForBooking(bookingId, selectedPersonaId, selectedVehicleId);
  const { persona, userTags, bestCarOffer, primaryOfferType } = recommendations;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Configuration Panel */}
        <div className="mb-8 space-y-4">
          
          {/* Persona Selector */}
          <div className="bg-white shadow-sm rounded-lg p-4 flex items-center gap-4 overflow-x-auto">
            <span className="text-sm font-bold text-gray-500 whitespace-nowrap">Select Persona:</span>
            <div className="flex gap-2">
              <a 
                href={`/demo?vehicle=${selectedVehicleId || ''}`} 
                className={`px-3 py-1.5 rounded text-sm ${!selectedPersonaId ? 'bg-orange-500 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Auto (Random)
              </a>
              {PERSONAS.map(p => (
                <a 
                  key={p.id} 
                  href={`/demo?persona=${p.id}&vehicle=${selectedVehicleId || ''}`}
                  className={`px-3 py-1.5 rounded text-sm whitespace-nowrap ${selectedPersonaId === p.id ? 'bg-orange-500 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {p.label}
                </a>
              ))}
            </div>
          </div>

          {/* Vehicle Selector */}
          <div className="bg-white shadow-sm rounded-lg p-4 flex items-center gap-4 overflow-x-auto">
            <span className="text-sm font-bold text-gray-500 whitespace-nowrap">Current Car:</span>
            <div className="flex gap-2">
              <a 
                href={`/demo?persona=${selectedPersonaId || ''}`} 
                className={`px-3 py-1.5 rounded text-sm ${!selectedVehicleId ? 'bg-orange-500 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Auto (Worst)
              </a>
              {availableVehicles.map(v => (
                <a 
                  key={v.id} 
                  href={`/demo?persona=${selectedPersonaId || ''}&vehicle=${v.id}`}
                  className={`px-3 py-1.5 rounded text-sm whitespace-nowrap ${selectedVehicleId === v.id ? 'bg-orange-500 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {getVehicleDisplayName(v)}
                </a>
              ))}
            </div>
          </div>

        </div>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="bg-orange-500 text-white p-6">
          <h1 className="text-2xl font-bold">Demo: Digital Upsell Experience</h1>
          <p className="opacity-90 text-sm mt-1">Booking ID: {bookingId}</p>
        </div>

        {/* Persona Section */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-2">Detected Persona</h2>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl font-bold text-gray-800">{persona.label}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
              {primaryOfferType === "both" ? "Target: Mixed" : 
               primaryOfferType === "car" ? "Target: Vehicle" : 
               primaryOfferType === "protection" ? "Target: Protection" : "Target: None"}
            </span>
          </div>
          <p className="text-gray-600 mb-4 italic">"{persona.description}"</p>
          
          <div className="flex flex-wrap gap-2">
            {userTags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Car Offer Section */}
        <div className="p-6">
          {bestCarOffer ? (
            <div>
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <span>Current: <strong>{getVehicleDisplayName(bestCarOffer.fromVehicle)}</strong></span>
                <span>→</span>
                <span className="text-orange-600">Upgrade: <strong>{getVehicleDisplayName(bestCarOffer.toVehicle)}</strong></span>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-lg p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {bestCarOffer.message.headline}
                </h3>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {bestCarOffer.message.llmExplanation || bestCarOffer.message.formalExplanation}
                </p>

                <ul className="space-y-2 mb-4">
                  {bestCarOffer.message.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-orange-500 mt-1">•</span>
                      {bullet}
                    </li>
                  ))}
                </ul>

                {bestCarOffer.message.stat && (
                  <p className="text-xs text-gray-500 border-t border-orange-200 pt-3 mt-2">
                    <span className="font-semibold">Did you know?</span> {bestCarOffer.message.stat}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No car upgrade suggestion available for this booking.
            </div>
          )}
        </div>

        </div>

      </div>
    </div>
  );
}

