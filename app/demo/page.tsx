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

export default async function DemoPage({ searchParams }: { searchParams: Promise<{ persona?: string; vehicle?: string }> }) {
  // 1. Create a fresh demo booking
  const booking = await dataSource.createBooking();
  const bookingId = booking.id;
  
  // Get optional params
  const resolvedSearchParams = await searchParams;
  const selectedPersonaId = resolvedSearchParams.persona;
  const selectedVehicleId = resolvedSearchParams.vehicle;

  // Get available vehicles for selector
  const availableVehicles = await dataSource.getAvailableVehicles(bookingId);

  // 2. Get recommendations directly on the server
  const recommendations = await getRecommendationsForBooking(bookingId, selectedPersonaId, selectedVehicleId);
  const { persona, userTags, bestCarOffer, bestProtectionOffer, primaryOfferType, finalOffer } = recommendations;

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
               Ideal Categories: {persona.idealCategory?.join(", ") || "Any"}
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

        {/* Final Offer Section */}
        <div className="p-6 bg-slate-50">
            <h2 className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-4">Final Recommendation</h2>
            
            {finalOffer.type === 'car' ? (
               <div className="border-2 border-green-500 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-green-700">Car Upgrade</h3>
                        <p className="font-medium text-gray-900">{getVehicleDisplayName(finalOffer.car.vehicle)}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{finalOffer.car.totalScore.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">Match Score</div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {finalOffer.car.categoryMatch > 0 && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Category Match</span>}
                    {finalOffer.car.ecoMatch > 0 && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Eco Friendly</span>}
                    {finalOffer.car.spaceFit > 0 && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Space Fit</span>}
                  </div>
               </div>
            ) : finalOffer.type === 'protection' ? (
               <div className="border-2 border-blue-500 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-blue-700">Protection Plan</h3>
                        <p className="font-medium text-gray-900">{finalOffer.protection.protection.name}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{finalOffer.protection.totalScore.toFixed(1)}</div>
                         <div className="text-xs text-gray-500">Risk Score</div>
                    </div>
                  </div>
               </div>
            ) : (
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-white text-center text-gray-500">
                    No strong recommendation found.
                    <p className="text-xs mt-1">{finalOffer.reason}</p>
                </div>
            )}
        </div>

        {/* Car Offer Section (Detailed) */}
        <div className="p-6">
          {bestCarOffer ? (
            <div>
              <div className="flex items-center justify-between gap-2 mb-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>Current: <strong>{getVehicleDisplayName(bestCarOffer.fromVehicle)}</strong> ({bestCarOffer.fromVehicle.price} {bestCarOffer.fromVehicle.currency})</span>
                  <span>→</span>
                  <span className="text-orange-600">Upgrade: <strong>{getVehicleDisplayName(bestCarOffer.toVehicle)}</strong> ({bestCarOffer.toVehicle.price} {bestCarOffer.toVehicle.currency})</span>
                </div>
                {bestCarOffer.priceDifference && bestCarOffer.priceDifference > 0 && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-bold">
                    +{bestCarOffer.priceDifference.toFixed(2)} {bestCarOffer.toVehicle.currency} / day
                  </span>
                )}
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

        {/* Protection Offer Section (Detailed) */}
        <div className="p-6 bg-blue-50 border-t border-blue-100">
          {bestProtectionOffer ? (
            <div>
              <div className="flex items-center justify-between gap-2 mb-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-blue-700 font-bold uppercase text-xs tracking-wider">Recommended Protection</span>
                  <span className="text-gray-900 font-bold">{bestProtectionOffer.protection.name}</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">
                  +{bestProtectionOffer.priceDifference?.toFixed(2)} {bestProtectionOffer.protection.currency} / day
                </span>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-xl font-bold text-blue-900 mb-3">
                  {bestProtectionOffer.message.headline}
                </h3>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {bestProtectionOffer.message.llmExplanation || bestProtectionOffer.message.formalExplanation}
                </p>

                <ul className="space-y-2 mb-4">
                  {bestProtectionOffer.message.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 mt-1">✓</span>
                      {bullet}
                    </li>
                  ))}
                </ul>

                {bestProtectionOffer.message.stat && (
                  <p className="text-xs text-gray-500 border-t border-blue-100 pt-3 mt-2">
                    <span className="font-semibold">Did you know?</span> {bestProtectionOffer.message.stat}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No protection suggestion available.
            </div>
          )}
        </div>

        </div>

      </div>
    </div>
  );
}
