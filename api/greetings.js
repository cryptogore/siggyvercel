export default function handler(req, res){

  const greetings = [
    "yo traveler 👋 I'm Siggy",
    "psst... hey explorer 🐾",
    "welcome wanderer ✨",
    "hey there stranger 😼",
    "ah... another curious soul 🔮"
  ];

  const g = greetings[Math.floor(Math.random()*greetings.length)];

  res.status(200).json({ greeting: g });
}