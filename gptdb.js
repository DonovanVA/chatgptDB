/* 
ChatGPT-powered Knowledge base (use case: nutritional database)
1. Be kind to GPT (No orders)
2. State search paremeters
3. String match for values
*/

import dotenv from "dotenv";
dotenv.config();
const url = 'https://api.openai.com/v1/chat/completions';

/* Other prompts: 
1. Serving: What is the nutritional content for cooked chinese sausage per serving? List me the exact calories, protein, carbohydrates and fats in g, try to give me a value as I need it
2. Piece:  What is the nutritional content for cooked chinese sausage per piece? List me the exact calories, protein, carbohydrates and fats in g, try to give me a value as I need it
*/
const data = {
  "model": "text-davinci-003",
  "messages": [{"role": "user", "content": "What is the nutritional content for cooked chinese sausage per 100g? List me the exact calories, protein, carbohydrates and fats in g, try to give me a value as I need it"}],
  "temperature": 0.7
};

// Set the headers for the request
const key = process.env.OPENAI_KEY
const headers = new Headers({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${key}`,  // Your API key goes here

});

// Create the request object
const request = new Request(url, {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(data)
});
// match the appropriate values
const stringMatchNutrition =(message)=>{
  // 1. Match
  const caloriesPos = message.toLowerCase().search("calories")
  const proteinPos = message.toLowerCase().search("protein")
  const carbPos = message.toLowerCase().search("carbohydrates")
  const fatsPos = message.toLowerCase().search("fat")
  //2. Find the values
  const caloriesnextWhitespace = caloriesPos + message.slice(caloriesPos).search(/\s/);
  const caloriesvalue = message.slice(caloriesnextWhitespace+1).split("\n")
  console.log(parseInt(caloriesvalue))

  const proteinnextWhitespace = proteinPos + message.slice(proteinPos).search(/\s/);
  const proteinvalue = message.slice(proteinnextWhitespace+1).split("\n")
  console.log(parseInt(proteinvalue))

  const carbsnextWhitespace = carbPos + message.slice(carbPos).search(/\s/);
  const carbsvalue = message.slice(carbsnextWhitespace+1).split("\n")
  console.log(parseInt(carbsvalue))

  const fatsnextWhitespace = fatsPos + message.slice(fatsPos).search(/\s/);
  const fatsvalue = message.slice(fatsnextWhitespace+1).split("\n")
  console.log(parseInt(fatsvalue))

}



// Send the request and handle the response

fetch(request)
  .then(response => {
    if (!response.ok) {
      console.error('There was a problem with the fetch:');
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log(stringMatchNutrition(data.choices[0].message.content));
  })
  .catch(error => {
    console.error('There was a problem with the fetch:', error);
  });
  
  /*eg response
stringMatch(`the nutritional content for cooked chinese sausage per 100g is:

  calories: 496
  protein: 15g
  carbohydrates: 2g
  fat: 47g`)
*/