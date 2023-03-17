/* 
ChatGPT-powered Knowledge base (use case: nutritional database)
1. Be kind to GPT (No orders)
2. State search paremeters
3. String match for values
*/

import dotenv from "dotenv";
dotenv.config();
import fetch, { Headers, Request } from "node-fetch";
/* Other prompts: 
1. Serving: What is the nutritional content for cooked chinese sausage per serving? List me the exact calories, protein, carbohydrates and fats in g, try to give me a value as I need it
2. Piece:  What is the nutritional content for cooked chinese sausage per piece? List me the exact calories, protein, carbohydrates and fats in g, try to give me a value as I need it
*/

const test_case_1 = `
The nutritional content of cooked Chinese sausage per 100g is:

Calories: 388 kcal
Protein: 16.1 g
Carbohydrates: 1.8 g
Fat: 35.6 g

`;
const test_case_2 = `As an AI language model, I do not have access to the specific recipe or brand of char kway teow. However, the nutritional content of char kway teow can vary greatly depending on the ingredients and cooking methods used. Generally, char kway teow is a stir-fried noodle dish that is typically high in fat and calories.

According to a general nutritional analysis, cooked char kway teow may contain approximately:

- Calories: 300-400 kcal
- Protein: 8-10 g
- Carbohydrates: 40-50 g
- Fat: 12-20 g`;

const test_case_3 = `
As an AI language model, I don't have access to the exact nutritional content of a specific brand or recipe for cooked char kway teow. However, here is a rough estimate of the general nutritional content per 100g of cooked char kway teow:

- Calories: around 300-400 kcal
- Protein: around 8-10g
- Carbohydrates: around 40-50g
- Fat: around 10-15g

It is important to note that char kway teow is typically high in saturated fat and sodium, so it should be consumed in moderation as part of a balanced diet
`;

const test_case_4 = `As an AI language model, I do not have the exact nutritional content for cooked char kway teow per 100g as it can vary based on different recipes and cooking methods. However, the general nutritional content may include:

- Calories: Approximately 300-400 calories per 100g
- Protein: Around 5-10g per 100g
- Carbohydrates: Around 30-40g per 100g
- Fat: Around 15-25g per 100g

It is important to note that char kway teow is typically high in saturated fat and sodium, so it should be consumed in moderation as part of a balanced diet.`;
export const keywords = ["calories", "protein", "carbohydrates", "fat"];

// Set the headers for the request

const stringMatchNutrition = (message) => {
  // 1. init max size counter
  let l_counter = 0;
  // 2. search for the keyword
  for (let i = 0; i < keywords.length; i++) {
    let pos = message.toLowerCase().search(keywords[i]);
    // 3. first match ,apply checkPostFix to see if there is a value after an approximation word, if there is then sliced will return a string that cuts that word
    let sliced = message
      .toLowerCase()
      .slice(
        pos +
          keywords[i].length +
          checkPostFix(pos, message, keywords[i].length)
          +2 // this is to omit the ": " after the bullet point, assumes that ": " always exits for key value pairs in the bullet points, keywords in sentences should not be affected "calories xabc" = "abc"
      );
   
        
    let value = sliced.split("\n");
    // 3. sliced is broken down into words

    // 4. Find subsequent values if there exists a NaN for the first word, this means that this first word is not in the bullet point max retries == 3, if still NaN, return NaN, and no bullet point exists
    l_counter = 0;
    while (true) {
      if (!isNaN(parseFloat(value[0])) || l_counter >= 3) {
        break;
      }
      // 5. remove the first word from the sliced
      sliced = sliced.split(' ').slice(1).join(' ')
      // 6. look for the next occurence of the keyword
      pos = sliced.search(keywords[i]);
      sliced = sliced.slice(
        pos + keywords[i].length + checkPostFix(pos, sliced, keywords[i].length)+2
      );
      value = sliced.split("\n");
      l_counter++;
    }
    // these are the return values of the string


    console.log(parseFloat(filterValueString(value[0])));
  }
};
// function to check for the approximaton word
const checkPostFix = (pos, inputString, length) => {
  //1. get the string after the keyword
  const resultant_string = inputString.slice(pos + length);
  //2. split into words
  let words = resultant_string.split(" ");
  let indexToSkip = 1;
  let nextWord = words[indexToSkip + 1];
  //3. check for the word after the filler word, if number return the length to cut
  if (!isNaN(parseFloat(nextWord))) {
    return inputString.indexOf(nextWord) - pos - length - 2
  }
  //4. else do not cut
  return 0;
};
// Utility function to remove any units from string
const removeUnitFromString=(inputString) =>{
  const regex = /[a-zA-Z]+$/;
  const match = inputString.match(regex);
  if (match) {
    const unit = match[0];
    return inputString.replace(unit, "").trim();
  }
  return inputString;
}

// checks if the a value is a range, if it is then take the average
const filterValueString = (inputString) => {
  //1. clean the input
  const inputValue = inputString.split(" ")[0];

  const denoised_input = removeUnitFromString(inputValue);
  const rangePattern = /^(\d+)-(\d+)$/;

  //2. check if inputString matches the range pattern, if it is take the average
  const matches = denoised_input.match(rangePattern);
  if (matches) {
    // calculate average of the two numbers in the range
    const num1 = parseFloat(matches[1]);
    const num2 = parseFloat(matches[2]);
    return ((num1 + num2) / 2).toString();
  } else {
    // 3. inputString is not a range, return the exact value
    return parseFloat(inputValue);
  }
};



console.log("test_case_1:")
stringMatchNutrition(test_case_1)
/* expected return result: 
388
16.1
1.8
35.6
*/
console.log("test_case_2:")
stringMatchNutrition(test_case_2)
/* Expected return result:
350
9
45
16
*/
console.log("test_case_3:")
stringMatchNutrition(test_case_3); //keyword
/* Expected return result:
350
9
45
12.5
*/
console.log("test_case_4:")
stringMatchNutrition(test_case_4); //keyword
/* Expected return result
350
7.5
35
20
*/

// (real implementation) Send the request and handle the response
/*
const qn1 =
  "could you give me the general nutritional content for cooked chinese sausage per 100g? List me the exact calories, protein, carbohydrates and fat in g if possible, in bullet point form";
const qn2 =
  "could you give me the general nutritional content for cooked char kway teow per 100g? List me the exact calories, protein, carbohydrates and fat in g if possible, in bullet point form ";

const url = "https://api.openai.com/v1/chat/completions";
const key = process.env.OPENAI_KEY;
const headers = new Headers({
  "Content-Type": "application/json",
  Authorization: `Bearer ${key}`, // Your API key goes here
});
const data = {
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: qn2}],
  temperature: 0.7,
};
// Create the request object
const request = new Request(url, {
  method: "POST",
  headers: headers,
  body: JSON.stringify(data),
});

fetch(request)
  .then(response => {
    if (!response.ok) {
      console.error('There was a problem with the fetch:');
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log(stringMatchNutrition(data.choices[0].message.content)); //data.choices[0].message.content is the message content
    console.log(data.choices[0].message.content)
  })
  .catch(error => {
    console.error('There was a problem with the fetch:', error);
  });
*/
