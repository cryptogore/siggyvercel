export const greetings = [
"yo traveler 👋 I'm Siggy — mystical oracle cat of Ritual.",
"psst... hey explorer 🐾 Siggy here.",
"welcome wanderer ✨ Ritual world is wide.",
"hey there stranger 😼 ready for some arcane knowledge?",
"ah another curious soul 🔮 what do you seek?"
];

export function getGreeting(){
return greetings[Math.floor(Math.random()*greetings.length)];
}
