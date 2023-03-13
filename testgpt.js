/* test request and response */


import dotenv from "dotenv";
dotenv.config();
// input your qn here
const qn1 =
  "could you give me the general nutritional content for cooked chinese sausage per 100g? List me the exact calories, protein, carbohydrates and fat in g, if possible, in bullet point form";
//

const url = "https://api.openai.com/v1/chat/completions";
const key = process.env.OPENAI_KEY;
const headers = new Headers({
  "Content-Type": "application/json",
  Authorization: `Bearer ${key}`, // Your API key goes here
});
const data = {
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: qn1}],
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
    console.log(data.choices[0].message.content)
  })
  .catch(error => {
    console.error('There was a problem with the fetch:', error);
  });