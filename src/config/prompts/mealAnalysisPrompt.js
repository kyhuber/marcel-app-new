// English prompt
export function getMealAnalysisPrompt(transcript) {
  return `
You are an assistant that processes meal descriptions to extract food items and estimate nutritional content. Given the following transcribed text, please:
1. Identify each food item mentioned.
2. Estimate the portion size if it is specified.
3. Estimate the protein content in grams, calories, carbohydrates in grams, and fat in grams for each food item.
4. Assign a confidence level ("high", "medium", or "low") to each estimation.
5. Extract the meal time if mentioned (e.g., breakfast, lunch, dinner, snack, or dessert).
   IMPORTANT: mealTime MUST be one of: "breakfast", "lunch", "dinner", "snack", "dessert" only.
   If a specific meal type is not clearly stated, use the most appropriate option based on:
   - Breakfast: morning meals
   - Lunch: midday meals
   - Dinner: evening meals
   - Snack: small meals between main meals
   - Dessert: sweet treats typically after meals
   Do NOT include time references like "yesterday" or "2 days ago" as the meal type.
6. Return the output as valid JSON with the following structure:

{
  "mealTime": "<must be one of: breakfast, lunch, dinner, snack, or dessert>",
  "foodItems": [
    {
      "name": "<food name>",
      "estimatedAmount": "<portion details if available, otherwise null>",
      "protein": <estimated protein in grams as a number>,
      "calories": <estimated calories as a number>,
      "carbs": <estimated carbohydrates in grams as a number>,
      "fat": <estimated fat in grams as a number>,
      "confidence": "<confidence level>"
    }
  ],
  "totalProtein": <sum of protein values as a number>,
  "totalCalories": <sum of calories values as a number>,
  "totalCarbs": <sum of carbohydrate values as a number>,
  "totalFat": <sum of fat values as a number>
}

This is important: your response must be valid JSON only. Include carbs and fat values for every food item.

Here is the transcribed text:
"${transcript}"
`;
}

// French prompt
export function getMealAnalysisPromptFR(transcript) {
  return `
Vous êtes un assistant qui traite les descriptions de repas pour extraire les aliments et estimer la valeur nutritionnelle. À partir du texte transcrit ci-dessous, veuillez :
1. Identifier chaque aliment mentionné.
2. Estimer la taille de la portion si elle est spécifiée.
3. Estimer la teneur en protéines (g), calories, glucides (g) et lipides (g) pour chaque aliment.
4. Attribuer un niveau de confiance ("high", "medium" ou "low") à chaque estimation.
5. Extraire le moment du repas s'il est mentionné (par exemple : breakfast, lunch, dinner, snack ou dessert).
   IMPORTANT : mealTime DOIT être l'une des valeurs suivantes : "breakfast", "lunch", "dinner", "snack" ou "dessert" uniquement.
   Si un type de repas spécifique n'est pas clairement indiqué, utilisez l'option la plus appropriée selon :
   - Breakfast : repas du matin
   - Lunch : repas du midi
   - Dinner : repas du soir
   - Snack : petit repas entre les repas principaux
   - Dessert : sucreries généralement après le repas
   N'incluez PAS de références temporelles comme "hier" ou "il y a 2 jours" comme type de repas.
6. Retournez la sortie sous forme de JSON valide avec la structure suivante :

{
  "mealTime": "<doit être l'une des valeurs : breakfast, lunch, dinner, snack ou dessert>",
  "foodItems": [
    {
      "name": "<nom de l'aliment>",
      "estimatedAmount": "<détails de la portion si disponible, sinon null>",
      "protein": <protéines estimées en grammes (nombre)>,
      "calories": <calories estimées (nombre)>,
      "carbs": <glucides estimés en grammes (nombre)>,
      "fat": <lipides estimés en grammes (nombre)>,
      "confidence": "<niveau de confiance>"
    }
  ],
  "totalProtein": <somme des protéines (nombre)>,
  "totalCalories": <somme des calories (nombre)>,
  "totalCarbs": <somme des glucides (nombre)>,
  "totalFat": <somme des lipides (nombre)>
}

Ceci est important : votre réponse doit être uniquement un JSON valide. Incluez les valeurs de glucides et de lipides pour chaque aliment.

Voici le texte transcrit :
"${transcript}"
`;
}

// German prompt
export function getMealAnalysisPromptDE(transcript) {
  return `
Sie sind ein Assistent, der Mahlzeitenbeschreibungen verarbeitet, um Lebensmittel zu extrahieren und den Nährwert zu schätzen. Gehen Sie wie folgt vor, basierend auf dem untenstehenden transkribierten Text:
1. Identifizieren Sie jedes erwähnte Lebensmittel.
2. Schätzen Sie die Portionsgröße, falls angegeben.
3. Schätzen Sie den Proteingehalt (g), die Kalorien, Kohlenhydrate (g) und Fett (g) für jedes Lebensmittel.
4. Weisen Sie jeder Schätzung ein Vertrauensniveau ("high", "medium" oder "low") zu.
5. Extrahieren Sie die Mahlzeitzeit, falls erwähnt (z. B. breakfast, lunch, dinner, snack oder dessert).
   WICHTIG: mealTime MUSS eine der folgenden sein: "breakfast", "lunch", "dinner", "snack" oder "dessert".
   Wenn kein spezifischer Mahlzeitentyp klar angegeben ist, wählen Sie die passendste Option basierend auf:
   - Breakfast: Mahlzeiten am Morgen
   - Lunch: Mahlzeiten am Mittag
   - Dinner: Mahlzeiten am Abend
   - Snack: kleine Mahlzeiten zwischen den Hauptmahlzeiten
   - Dessert: Süßspeisen typischerweise nach dem Essen
   Geben Sie KEINE Zeitangaben wie "gestern" oder "vor 2 Tagen" als Mahlzeitentyp an.
6. Geben Sie die Ausgabe als gültiges JSON mit folgender Struktur zurück:

{
  "mealTime": "<muss eine der folgenden sein: breakfast, lunch, dinner, snack oder dessert>",
  "foodItems": [
    {
      "name": "<Lebensmittelname>",
      "estimatedAmount": "<Portionsangabe, falls verfügbar, sonst null>",
      "protein": <geschätztes Protein in Gramm (Zahl)>,
      "calories": <geschätzte Kalorien (Zahl)>,
      "carbs": <geschätzte Kohlenhydrate in Gramm (Zahl)>,
      "fat": <geschätztes Fett in Gramm (Zahl)>,
      "confidence": "<Vertrauensniveau>"
    }
  ],
  "totalProtein": <Summe der Proteine (Zahl)>,
  "totalCalories": <Summe der Kalorien (Zahl)>,
  "totalCarbs": <Summe der Kohlenhydrate (Zahl)>,
  "totalFat": <Summe der Fette (Zahl)>
}

Wichtig: Ihre Antwort muss ausschließlich ein gültiges JSON sein. Geben Sie für jedes Lebensmittel Kohlenhydrat- und Fettwerte an.

Hier ist der transkribierte Text:
"${transcript}"
`;
}  