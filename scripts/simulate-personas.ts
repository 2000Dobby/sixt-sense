
import { PERSONAS, getUserTagsFromPersona } from "@/lib/personas";
import { scoreVehicleForUser } from "@/lib/recommendations";
import { mockDataSource } from "@/lib/dataSource.mock";

async function simulateAllPersonas() {
  console.log("--- Simulation: Car Recommendations per Persona ---");
  
  const vehicles = await mockDataSource.getAvailableVehicles("dummy");
  
  for (const persona of PERSONAS) {
    console.log(`\nPersona: ${persona.label} (${persona.id})`);
    const userTags = getUserTagsFromPersona(persona);
    
    // Score all vehicles
    const scored = vehicles.map(v => scoreVehicleForUser(persona, userTags, v));
    scored.sort((a, b) => b.totalScore - a.totalScore);
    
    const best = scored[0];
    const worst = scored[scored.length - 1];
    
    console.log(`   Best Car: ${best.vehicle.model} (Score: ${best.totalScore.toFixed(2)})`);
    console.log(`   Worst Car (Booked): ${worst.vehicle.model} (Score: ${worst.totalScore.toFixed(2)})`);
    
    // Check if valid upgrade exists from worst
    const upgrade = scored.find(sv => {
        if (sv.vehicle.id === worst.vehicle.id) return false;
        const toPrice = (sv.vehicle as any).price || 0;
        const fromPrice = (worst.vehicle as any).price || 0;
        
        // Logic from lib/recommendations.ts
        if (toPrice <= fromPrice) return false;
        return sv.totalScore > worst.totalScore;
    });
    
    if (upgrade) {
        console.log(`   -> Upgrade Offer: ${upgrade.vehicle.model} (+${(upgrade.vehicle as any).price - (worst.vehicle as any).price})`);
    } else {
        console.log(`   -> NO Upgrade Offer found (from ${worst.vehicle.model})`);
    }
  }
}

simulateAllPersonas();

