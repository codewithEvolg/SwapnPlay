const express = require('express');
const router = express.Router();
const { getToys, insertNewToy, getToysByName, getToysBySubId, getToysByAgeGroup, getToysByCondition } = require("../../db/queries/toys");
const config = require('config');
const { Configuration, OpenAIApi } = require("openai");
const apiKey = config.get('OPEN_AI_KEY');

const configuration = new Configuration({
  apiKey
});
const openai = new OpenAIApi(configuration);

//Get AI generated toy description
router.post('/generate-toy-description', async (req, res) => {
  console.log("Entering enhanced description in server");
  try {
    const body = req.body;
    let prompt = `Please rewrite the description for the following toy to sell it online:\n${body.prompt}`

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 128,
      temperature: 0,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: "{\n}",
    });

    let description = response.data.choices[0].text.replace(/(\r\n|\n|\r)/gm, "");
    return res.status(200).json({
      success: true,
      data: description,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(400).json({
      success: false,
      error: error.response
        ? error.response.data
        : "There was an issue on the server",
    });
  }
});

/**
 * @swagger
 * /api/toys:
 *   get:
 *     summary: Get a list of toys
 *     description: Retrieve a list of toys from the database.
 *     responses:
 *       200:
 *         description: A list of toys
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Toy'
 *       500:
 *         description: An internal server error occurred.
 */

/**
 * @swagger
 * /api/toys/new:
 *   post:
 *     summary: Create a new toy
 *     description: Create a new toy and add it to the database.
 *     parameters:
 *       - in: body
 *         name: toy
 *         description: The toy object to create.
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Toy'
 *     responses:
 *       201:
 *         description: The newly created toy
 *         schema:
 *           $ref: '#/definitions/Toy'
 *       400:
 *         description: Bad request. Invalid input data.
 *       500:
 *         description: An internal server error occurred.
 */

/**
 * @swagger
 * definitions:
 *   Toy:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       name:
 *         type: string
 *       description:
 *         type: string
 */

router.get('/', (req, res) => {
  getToys()
    .then((toys) => {
      res.send(toys);
    })
    .catch((err) => {
      console.log(`An error occurred: ${err}`)
    });
});


// Set up a route to create a new toy
router.post('/new', (req, res) => {
  const body = req.body;
  insertNewToy(body)
    .then((toy) => {
      console.log("Toy data added in the database.")
      res.status(201).send(toy);
    })
    .catch((err) => {
      console.log(`An error occurred: ${err}`)
    });
});

router.post('/searchQuery', (req, res) => {
  const { searchQuery } = req.body;

  if (!searchQuery) {
    return res.status(400).json({ error: "Name is required" });
  }
  console.log(searchQuery);
  getToysByName(searchQuery)
    .then((toys) => {
      res.send(toys);
    })
    .catch((err) => {
      console.log(`An error occurred: ${err}`);
    });
});

// Get toys data by subId
router.get('/:subId', async (req, res) => {
  try {
    const toys = await getToysBySubId(req.params.subId);
    if (!toys) {
      return res.status(404).json({ error: 'No toys found for user' });
    }
    res.json(toys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/filter', (req, res) => {
  const { filterType, filterValue } = req.body;

  if (!filterType) {
    return res.status(400).json({ error: "Filter type and value are required" });
  }

  if (filterType === "AgeGroup") {
    getToysByAgeGroup(filterValue)
      .then((toys) => {
        res.send(toys);

      })
      .catch((err) => {
        console.log(`An error occurred: ${err}`);
      });
  } else if (filterType === "Condition") {
    getToysByCondition(filterValue)
      .then((toys) => {
        res.send(toys);

      })
      .catch((err) => {
        console.log(`An error occurred: ${err}`);
      });
  }
});

module.exports = router;
