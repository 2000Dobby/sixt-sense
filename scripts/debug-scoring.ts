
import { scoreProtectionForUser, getVehicleScoreWeights, getProtectionScoreWeights, scoreVehicleForUser } from "../lib/recommendations";
import { PERSONAS, getUserTagsFromPersona } from "../lib/personas";
import { mockDataSource } from "../lib/dataSource.mock";

async function debugScoring() {
  const persona = PERSONAS.find(p => p.id === "family_holiday_planner")!; // Risk Averse
  const userTags = getUserTagsFromPersona(persona);
  
  const protections = await mockDataSource.getAvailableProtections("debug");
  
  console.log(`Persona: ${persona.label}, Risk: ${persona.riskAttitude}`);
  
  protections.forEach(p => {
    const scored = scoreProtectionForUser(persona, userTags, p);
    console.log(`\nProtection: ${p.name} (${p.price} EUR)`);
    console.log(`Tags: ${scored.tags.join(", ")}`);
    console.log(`Risk Score: ${scored.riskCoverageScore}`);
    console.log(`Price Penalty: ${scored.pricePenalty.toFixed(2)}`);
    console.log(`Total Score: ${scored.totalScore.toFixed(2)}`);
  });

  const luxuryPersona = PERSONAS.find(p => p.id === "luxury_enthusiast")!;
  const luxuryTags = getUserTagsFromPersona(luxuryPersona);
  console.log(`\n\nPersona: ${luxuryPersona.label}, Risk: ${luxuryPersona.riskAttitude}`);
  
  protections.forEach(p => {
    const scored = scoreProtectionForUser(luxuryPersona, luxuryTags, p);
    console.log(`\nProtection: ${p.name} (${p.price} EUR)`);
    console.log(`Tags: ${scored.tags.join(", ")}`);
    console.log(`Risk Score: ${scored.riskCoverageScore}`);
    console.log(`Price Penalty: ${scored.pricePenalty.toFixed(2)}`);
    console.log(`Total Score: ${scored.totalScore.toFixed(2)}`);
  });
}

debugScoring();

